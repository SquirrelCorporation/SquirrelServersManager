import { Response } from 'express';
import { SettingsKeys, SsmAnsible } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsController } from '../presentation/controllers/settings.controller';

describe('SettingsController', () => {
  let controller: SettingsController;
  let mockSettingsService: any;
  let mockAdvancedOperationsService: any;
  let mockInformationService: any;

  beforeEach(async () => {
    mockSettingsService = {
      getSetting: vi.fn(),
      getSettingOrThrow: vi.fn(),
      getIntSetting: vi.fn(),
      setSetting: vi.fn(),
      setSettingIfNotExists: vi.fn(),
      deleteSetting: vi.fn(),
      resetSettings: vi.fn(),
      getSettingWithDefault: vi.fn(),
      initializeDefaults: vi.fn(),
    };

    mockAdvancedOperationsService = {
      restartServer: vi.fn(),
      deleteLogs: vi.fn(),
      deleteAnsibleLogs: vi.fn(),
      deletePlaybooksModelAndResync: vi.fn(),
    };

    mockInformationService = {
      getMongoDBStats: vi.fn(),
      getRedisStats: vi.fn(),
      getPrometheusStats: vi.fn(),
    };

    controller = new SettingsController(
      mockSettingsService,
      mockAdvancedOperationsService,
      mockInformationService,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('updateDashboardSetting', () => {
    it('should update CPU performance threshold', async () => {
      const key = SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER;
      const value = 80;

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateDashboardSetting({ key }, { value });

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });

    it('should update memory performance threshold', async () => {
      const key = SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER;
      const value = 20;

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateDashboardSetting({ key }, { value });

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });

    it('should return error for unknown key', async () => {
      const key = 'unknown-key';
      const value = 50;

      const result = await controller.updateDashboardSetting({ key }, { value });

      expect(mockSettingsService.setSetting).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, message: 'Unknown key' });
    });
  });

  describe('updateDevicesSetting', () => {
    it('should update device offline threshold', async () => {
      const key = SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES;
      const value = 15;

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateDevicesSetting({ key }, { value });

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });
  });

  describe('updateLogsSetting', () => {
    it('should update ansible cleanup threshold', async () => {
      const key =
        SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS;
      const value = 3600;

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateLogsSetting({ key }, { value });

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });

    it('should update server log retention', async () => {
      const key = SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS;
      const value = 30;

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateLogsSetting({ key }, { value });

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });
  });

  describe('updateDeviceStatsSetting', () => {
    it('should update device stats retention', async () => {
      const key = SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS;
      const value = 90;

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateDeviceStatsSetting({ key }, { value });

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });
  });

  describe('updateMasterNodeUrl', () => {
    it('should update master node URL', async () => {
      const value = 'http://master-node:8080';

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateMasterNodeUrl({ value });

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(
        SsmAnsible.DefaultSharedExtraVarsList.MASTER_NODE_URL,
        value,
      );
      expect(result).toBe(value);
    });
  });

  describe('restartServer', () => {
    it('should call advanced operations service', async () => {
      mockAdvancedOperationsService.restartServer.mockResolvedValue(undefined);

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        sendStatus: vi.fn(),
        links: vi.fn(),
        send: vi.fn(),
        jsonp: vi.fn(),
      } as unknown as Response;

      await controller.restartServer(mockResponse);

      expect(mockAdvancedOperationsService.restartServer).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Server restart initiated',
      });
    });
  });

  describe('deleteLogs', () => {
    it('should call advanced operations service', async () => {
      mockAdvancedOperationsService.deleteLogs.mockResolvedValue(undefined);

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        sendStatus: vi.fn(),
        links: vi.fn(),
        send: vi.fn(),
        jsonp: vi.fn(),
      } as unknown as Response;

      await controller.deleteLogs(mockResponse);

      expect(mockAdvancedOperationsService.deleteLogs).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Logs Purged Successfully',
      });
    });
  });

  describe('deleteAnsibleLogs', () => {
    it('should call advanced operations service', async () => {
      mockAdvancedOperationsService.deleteAnsibleLogs.mockResolvedValue(undefined);

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        sendStatus: vi.fn(),
        links: vi.fn(),
        send: vi.fn(),
        jsonp: vi.fn(),
      } as unknown as Response;

      await controller.deleteAnsibleLogs(mockResponse);

      expect(mockAdvancedOperationsService.deleteAnsibleLogs).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Ansible logs Purged Successfully',
      });
    });
  });

  describe('deletePlaybooksAndResync', () => {
    it('should call advanced operations service', async () => {
      mockAdvancedOperationsService.deletePlaybooksModelAndResync.mockResolvedValue(undefined);

      await controller.deletePlaybooksAndResync();

      expect(mockAdvancedOperationsService.deletePlaybooksModelAndResync).toHaveBeenCalled();
    });
  });

  describe('getMongoDBStats', () => {
    it('should call information service', async () => {
      const mockStats = { some: 'stats' };
      mockInformationService.getMongoDBStats.mockResolvedValue(mockStats);

      const result = await controller.getMongoDBStats();

      expect(mockInformationService.getMongoDBStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('getRedisStats', () => {
    it('should call information service', async () => {
      const mockStats = { some: 'stats' };
      mockInformationService.getRedisStats.mockResolvedValue(mockStats);

      const result = await controller.getRedisStats();

      expect(mockInformationService.getRedisStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('getPrometheusStats', () => {
    it('should call information service', async () => {
      const mockStats = { some: 'stats' };
      mockInformationService.getPrometheusStats.mockResolvedValue(mockStats);

      const result = await controller.getPrometheusStats();

      expect(mockInformationService.getPrometheusStats).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });
});
