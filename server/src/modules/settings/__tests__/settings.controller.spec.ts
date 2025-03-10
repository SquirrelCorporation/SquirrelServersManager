import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsKeys } from 'ssm-shared-lib';
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
      mockInformationService
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

      const result = await controller.updateDashboardSetting(
        { key },
        { value },
      );

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });

    it('should update memory performance threshold', async () => {
      const key = SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER;
      const value = 20;

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateDashboardSetting(
        { key },
        { value },
      );

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });

    it('should return error for unknown key', async () => {
      const key = 'unknown-key';
      const value = 50;

      const result = await controller.updateDashboardSetting(
        { key },
        { value },
      );

      expect(mockSettingsService.setSetting).not.toHaveBeenCalled();
      expect(result).toEqual({ success: false, message: 'Unknown key' });
    });
  });

  describe('updateDevicesSetting', () => {
    it('should update device offline threshold', async () => {
      const key = SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES;
      const value = 15;

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateDevicesSetting(
        { key },
        { value },
      );

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });
  });

  describe('updateLogsSetting', () => {
    it('should update ansible cleanup threshold', async () => {
      const key = SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS;
      const value = 3600;

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateLogsSetting(
        { key },
        { value },
      );

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });

    it('should update server log retention', async () => {
      const key = SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS;
      const value = 30;

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateLogsSetting(
        { key },
        { value },
      );

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });
  });

  describe('updateDeviceStatsSetting', () => {
    it('should update device stats retention', async () => {
      const key = SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS;
      const value = 90;

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateDeviceStatsSetting(
        { key },
        { value },
      );

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith(key, value.toString());
      expect(result).toEqual({ success: true, message: `${key} successfully updated` });
    });
  });

  describe('updateMasterNodeUrl', () => {
    it('should update master node URL', async () => {
      const value = 'http://master-node:8080';

      mockSettingsService.setSetting.mockResolvedValue(undefined);

      const result = await controller.updateMasterNodeUrl({ value });

      expect(mockSettingsService.setSetting).toHaveBeenCalledWith('master-node-url', value);
      expect(result).toEqual({ success: true, message: 'Master node URL successfully updated' });
    });
  });

  describe('restartServer', () => {
    it('should call advanced operations service', async () => {
      mockAdvancedOperationsService.restartServer.mockResolvedValue(undefined);

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

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
      };

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
      };

      await controller.deleteAnsibleLogs(mockResponse);

      expect(mockAdvancedOperationsService.deleteAnsibleLogs).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Ansible logs Purged Successfully',
      });
    });
  });

  describe('deletePlaybooksModelAndResync', () => {
    it('should call advanced operations service', async () => {
      mockAdvancedOperationsService.deletePlaybooksModelAndResync.mockResolvedValue(undefined);

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.deletePlaybooksAndResync(mockResponse);

      expect(mockAdvancedOperationsService.deletePlaybooksModelAndResync).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'All data purged successfully',
      });
    });
  });

  describe('getMongoDBStats', () => {
    it('should call information service', async () => {
      const mockStats = { memory: {}, cpu: {}, connections: {}, operations: {} };
      mockInformationService.getMongoDBStats.mockResolvedValue(mockStats);

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.getMongoDBStats(mockResponse);

      expect(mockInformationService.getMongoDBStats).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Got MongoDB server stats',
        data: mockStats,
      });
    });
  });

  describe('getRedisStats', () => {
    it('should call information service', async () => {
      const mockStats = { memory: {}, cpu: {}, stats: {}, server: {} };
      mockInformationService.getRedisStats.mockResolvedValue(mockStats);

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.getRedisStats(mockResponse);

      expect(mockInformationService.getRedisStats).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Got Redis server stats',
        data: mockStats,
      });
    });
  });

  describe('getPrometheusStats', () => {
    it('should call information service', async () => {
      const mockStats = {};
      mockInformationService.getPrometheusStats.mockResolvedValue(mockStats);

      const mockResponse = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
      };

      await controller.getPrometheusStats(mockResponse);

      expect(mockInformationService.getPrometheusStats).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Got Prometheus server stats',
        data: mockStats,
      });
    });
  });
});