import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { API, SsmAgent, SsmAnsible } from 'ssm-shared-lib';
import { Logger } from '@nestjs/common';

// Mock dependencies
vi.mock('@modules/devices', () => ({
  DEVICES_SERVICE: Symbol('DEVICES_SERVICE'),
  IDevicesService: class IDevicesService {},
}));

vi.mock('@modules/users', () => ({
  USER_REPOSITORY: Symbol('USER_REPOSITORY'),
  IUserRepository: class IUserRepository {},
}));

vi.mock('@nestjs/cache-manager', () => ({
  CACHE_MANAGER: Symbol('CACHE_MANAGER'),
}));

// Import after mocks
import { ExtraVarsService } from '../../../../application/services/extra-vars.service';

describe('ExtraVarsService', () => {
  let extraVarsService: ExtraVarsService;
  let mockDevicesService: any;
  let mockUserRepository: any;
  let mockCacheManager: any;

  beforeEach(() => {
    // Create mocks
    mockDevicesService = {
      findOneByUuid: vi.fn(),
    };

    mockUserRepository = {
      findFirst: vi.fn(),
    };

    mockCacheManager = {
      get: vi.fn(),
      set: vi.fn(),
    };

    // Override Logger to avoid console output in tests
    vi.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
    vi.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);

    // Create service instance with mocks
    extraVarsService = new ExtraVarsService(
      mockDevicesService,
      mockUserRepository,
      mockCacheManager,
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('findValueOfExtraVars', () => {
    it('should return substituted extra vars', async () => {
      // Setup
      const extraVars: API.ExtraVars = [
        { extraVar: 'test', type: SsmAnsible.ExtraVarsType.SHARED, required: false },
      ];

      const forcedValues: API.ExtraVars = [{ extraVar: 'test', value: 'test-value' }];

      // Test
      const result = await extraVarsService.findValueOfExtraVars(extraVars, forcedValues);

      // Verify
      expect(result).toHaveLength(1);
      expect(result[0].value).toBe('test-value');
    });

    it('should throw error for required extraVars with no value', async () => {
      // Setup
      const extraVars: API.ExtraVars = [
        { extraVar: 'test', type: SsmAnsible.ExtraVarsType.SHARED, required: true },
      ];

      // Test & Verify
      await expect(extraVarsService.findValueOfExtraVars(extraVars)).rejects.toThrow(
        'ExtraVar value not found ! (test)',
      );
    });

    it('should use cached value for SHARED type', async () => {
      // Setup
      const extraVars: API.ExtraVars = [
        { extraVar: 'cached_var', type: SsmAnsible.ExtraVarsType.SHARED, required: false },
      ];

      mockCacheManager.get.mockResolvedValue('cached-value');

      // Test
      const result = await extraVarsService.findValueOfExtraVars(extraVars);

      // Verify
      expect(mockCacheManager.get).toHaveBeenCalledWith('cached_var');
      expect(result[0].value).toBe('cached-value');
    });

    it('should handle context variables for single device', async () => {
      // Setup
      const deviceId = '12345';
      const extraVars: API.ExtraVars = [
        {
          extraVar: SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP,
          type: SsmAnsible.ExtraVarsType.CONTEXT,
          required: false
        },
      ];

      const mockDevice = {
        uuid: deviceId,
        ip: '192.168.1.1',
        agentLogPath: '/var/log/ssm',
        agentType: SsmAgent.InstallMethods.NODE,
      };

      mockDevicesService.findOneByUuid.mockResolvedValue(mockDevice);

      // Test
      const result = await extraVarsService.findValueOfExtraVars(extraVars, undefined, false, [
        deviceId,

      // Verify
      expect(mockDevicesService.findOneByUuid).toHaveBeenCalledWith(deviceId);
      expect(result[0].value).toBe('192.168.1.1');
    });

    it('should throw error for context variables with multiple targets', async () => {
      // Setup
      const extraVars: API.ExtraVars = [
        {
          extraVar: SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP,
          type: SsmAnsible.ExtraVarsType.CONTEXT,
          required: false
        },
      ];

      // Test & Verify
      await expect(
        extraVarsService.findValueOfExtraVars(extraVars, undefined, false, ['device1', 'device2']),
      ).rejects.toThrow('Cannot use CONTEXT variable with multiple targets');
    });

    it('should throw error if device not found for context variables', async () => {
      // Setup
      const deviceId = 'non-existent';
      const extraVars: API.ExtraVars = [
        {
          extraVar: SsmAnsible.DefaultContextExtraVarsList.DEVICE_IP,
          type: SsmAnsible.ExtraVarsType.CONTEXT,
          required: false
        },
      ];

      mockDevicesService.findOneByUuid.mockResolvedValue(null);

      // Test & Verify
      await expect(
        extraVarsService.findValueOfExtraVars(extraVars, undefined, false, [deviceId]),
      ).rejects.toThrow('Targeted device not found');
    });

    it('should handle API_KEY context variable', async () => {
      // Setup
      const deviceId = '12345';
      const extraVars: API.ExtraVars = [
        {
          extraVar: SsmAnsible.DefaultContextExtraVarsList.API_KEY,
          type: SsmAnsible.ExtraVarsType.CONTEXT,
          required: false
        },
      ];

      const mockDevice = { uuid: deviceId, ip: '192.168.1.1' };
      const mockUser = { apiKey: 'test-api-key' };

      mockDevicesService.findOneByUuid.mockResolvedValue(mockDevice);
      mockUserRepository.findFirst.mockResolvedValue(mockUser);

      // Test
      const result = await extraVarsService.findValueOfExtraVars(extraVars, undefined, false, [
        deviceId,

      // Verify
      expect(mockUserRepository.findFirst).toHaveBeenCalled();
      expect(result[0].value).toBe('test-api-key');
    });

    it('should handle unknown context variables', async () => {
      // Setup
      const deviceId = '12345';
      const extraVars: API.ExtraVars = [
        {
          extraVar: 'UNKNOWN_CONTEXT_VAR',
          type: SsmAnsible.ExtraVarsType.CONTEXT,
          required: false
        },
      ];

      const mockDevice = { uuid: deviceId, ip: '192.168.1.1' };

      mockDevicesService.findOneByUuid.mockResolvedValue(mockDevice);

      // Test
      const result = await extraVarsService.findValueOfExtraVars(extraVars, undefined, true, [
        deviceId,

      // Verify
      expect(result[0].value).toBeUndefined();
    });
  });
});
