import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsService } from '../application/services/settings.service';
import { SETTING_REPOSITORY } from '../domain/repositories/setting-repository.interface';

describe('SettingsService', () => {
  let service: SettingsService;
  let mockSettingRepository: any;

  beforeEach(async () => {
    mockSettingRepository = {
      get: vi.fn(),
      getOrThrow: vi.fn(),
      getInt: vi.fn(),
      set: vi.fn(),
      setNX: vi.fn(),
      delete: vi.fn(),
      reset: vi.fn(),
      getWithDefault: vi.fn(),
    };

    const module = {
      get: vi.fn().mockImplementation((token) => {
        if (token === SETTING_REPOSITORY) {
          return mockSettingRepository;
        }
        return null;
      }),
    };

    service = new SettingsService(mockSettingRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSetting', () => {
    it('should call repository get method', async () => {
      mockSettingRepository.get.mockResolvedValue('value');
      const result = await service.getSetting('key');
      expect(mockSettingRepository.get).toHaveBeenCalledWith('key');
      expect(result).toBe('value');
    });
  });

  describe('getSettingOrThrow', () => {
    it('should call repository getOrThrow method', async () => {
      mockSettingRepository.getOrThrow.mockResolvedValue('value');
      const result = await service.getSettingOrThrow('key');
      expect(mockSettingRepository.getOrThrow).toHaveBeenCalledWith('key');
      expect(result).toBe('value');
    });
  });

  describe('getIntSetting', () => {
    it('should call repository getInt method', async () => {
      mockSettingRepository.getInt.mockResolvedValue(123);
      const result = await service.getIntSetting('key');
      expect(mockSettingRepository.getInt).toHaveBeenCalledWith('key');
      expect(result).toBe(123);
    });
  });

  describe('setSetting', () => {
    it('should call repository set method', async () => {
      await service.setSetting('key', 'value', 3600);
      expect(mockSettingRepository.set).toHaveBeenCalledWith(
        { key: 'key', value: 'value' },
        3600,
      );
    });
  });

  describe('setSettingIfNotExists', () => {
    it('should call repository setNX method', async () => {
      mockSettingRepository.setNX.mockResolvedValue(true);
      const result = await service.setSettingIfNotExists('key', 'value', 3600);
      expect(mockSettingRepository.setNX).toHaveBeenCalledWith(
        { key: 'key', value: 'value', nx: true },
        3600,
      );
      expect(result).toBe(true);
    });
  });

  describe('deleteSetting', () => {
    it('should call repository delete method', async () => {
      await service.deleteSetting('key');
      expect(mockSettingRepository.delete).toHaveBeenCalledWith('key');
    });
  });

  describe('resetSettings', () => {
    it('should call repository reset method', async () => {
      await service.resetSettings();
      expect(mockSettingRepository.reset).toHaveBeenCalled();
    });
  });

  describe('getSettingWithDefault', () => {
    it('should call repository getWithDefault method', async () => {
      mockSettingRepository.getWithDefault.mockResolvedValue('default');
      const result = await service.getSettingWithDefault('key', 'default');
      expect(mockSettingRepository.getWithDefault).toHaveBeenCalledWith('key', 'default');
      expect(result).toBe('default');
    });
  });

  describe('initializeDefaults', () => {
    it('should initialize default settings', async () => {
      mockSettingRepository.setNX.mockResolvedValue(true);
      mockSettingRepository.set.mockResolvedValue(undefined);

      await service.initializeDefaults();

      expect(mockSettingRepository.set).toHaveBeenCalled();
      expect(mockSettingRepository.setNX).toHaveBeenCalled();
    });
  });
});