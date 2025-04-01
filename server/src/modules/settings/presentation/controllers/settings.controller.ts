import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { Response } from 'express';
import { SettingsKeys, SsmAnsible } from 'ssm-shared-lib';
import { JwtAuthGuard } from '@modules/auth/strategies/jwt-auth.guard';
import {
  ISettingsService,
  SETTINGS_SERVICE,
} from '../../application/interfaces/settings-service.interface';
import { AdvancedOperationsService } from '../../application/services/advanced-operations.service';
import { InformationService } from '../../application/services/information.service';
import {
  DashboardSettingBodyDto,
  DashboardSettingParamDto,
  DashboardSettingsValidator,
} from '../validators/dashboard.validator';
import {
  DeviceStatsSettingBodyDto,
  DeviceStatsSettingParamDto,
  DeviceStatsSettingsValidator,
} from '../validators/device-stats.validator';
import {
  DevicesSettingBodyDto,
  DevicesSettingParamDto,
  DevicesSettingsValidator,
} from '../validators/devices.validator';
import {
  LogsSettingBodyDto,
  LogsSettingParamDto,
  LogsSettingsValidator,
} from '../validators/logs.validator';
import {
  MasterNodeUrlBodyDto,
  MasterNodeUrlValidator,
} from '../validators/master-node-url.validator';

@Controller('settings')
export class SettingsController {
  constructor(
    @Inject(SETTINGS_SERVICE)
    private readonly settingsService: ISettingsService,
    private readonly advancedOperationsService: AdvancedOperationsService,
    private readonly informationService: InformationService,
  ) {}

  @Post('dashboard/:key')
  @UsePipes(DashboardSettingsValidator)
  async updateDashboardSetting(
    @Param() params: DashboardSettingParamDto,
    @Body() body: DashboardSettingBodyDto,
  ) {
    const { key } = params;
    const { value } = body;

    switch (key) {
      case SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER:
        await this.settingsService.setSetting(
          SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_CPU_IF_LOWER,
          value.toString(),
        );
        return { success: true, message: `${key} successfully updated` };
      case SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER:
        await this.settingsService.setSetting(
          SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
          value.toString(),
        );
        return { success: true, message: `${key} successfully updated` };
      default:
        return { success: false, message: 'Unknown key' };
    }
  }

  @Post('devices/:key')
  @UsePipes(DevicesSettingsValidator)
  async updateDevicesSetting(
    @Param() params: DevicesSettingParamDto,
    @Body() body: DevicesSettingBodyDto,
  ) {
    const { key } = params;
    const { value } = body;

    switch (key) {
      case SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES:
        await this.settingsService.setSetting(
          SettingsKeys.GeneralSettingsKeys.CONSIDER_DEVICE_OFFLINE_AFTER_IN_MINUTES,
          value.toString(),
        );
        return { success: true, message: `${key} successfully updated` };
      default:
        return { success: false, message: 'Unknown key' };
    }
  }

  @Post('logs/:key')
  @UsePipes(LogsSettingsValidator)
  async updateLogsSetting(@Param() params: LogsSettingParamDto, @Body() body: LogsSettingBodyDto) {
    const { key } = params;
    const { value } = body;

    switch (key) {
      case SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS:
        await this.settingsService.setSetting(
          SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
          value.toString(),
        );
        return { success: true, message: `${key} successfully updated` };
      case SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS:
        await this.settingsService.setSetting(
          SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
          value.toString(),
        );
        return { success: true, message: `${key} successfully updated` };
      default:
        return { success: false, message: 'Unknown key' };
    }
  }

  @Post('device-stats/:key')
  @UsePipes(DeviceStatsSettingsValidator)
  async updateDeviceStatsSetting(
    @Param() params: DeviceStatsSettingParamDto,
    @Body() body: DeviceStatsSettingBodyDto,
  ) {
    const { key } = params;
    const { value } = body;

    switch (key) {
      case SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS:
        await this.settingsService.setSetting(
          SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS,
          value.toString(),
        );
        return { success: true, message: `${key} successfully updated` };
      default:
        return { success: false, message: 'Unknown key' };
    }
  }

  @Post('keys/master-node-url')
  @UsePipes(MasterNodeUrlValidator)
  async updateMasterNodeUrl(@Body() body: MasterNodeUrlBodyDto) {
    await this.settingsService.setSetting(
      SsmAnsible.DefaultSharedExtraVarsList.MASTER_NODE_URL,
      body.value,
    );
    return body.value;
  }

  @Post('advanced/restart')
  async restartServer(@Res() res: Response) {
    try {
      await this.advancedOperationsService.restartServer();
      return res.status(200).json({
        success: true,
        message: 'Server restart initiated',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to restart server',
        error: errorMessage,
      });
    }
  }

  @Delete('advanced/logs')
  async deleteLogs(@Res() res: Response) {
    try {
      await this.advancedOperationsService.deleteLogs();
      return res.status(200).json({
        success: true,
        message: 'Logs Purged Successfully',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to purge logs',
        error: errorMessage,
      });
    }
  }

  @Delete('advanced/ansible-logs')
  async deleteAnsibleLogs(@Res() res: Response) {
    try {
      await this.advancedOperationsService.deleteAnsibleLogs();
      return res.status(200).json({
        success: true,
        message: 'Ansible logs Purged Successfully',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to purge Ansible logs',
        error: errorMessage,
      });
    }
  }

  @Delete('advanced/playbooks-and-resync')
  async deletePlaybooksAndResync(@Res() res: Response) {
    try {
      await this.advancedOperationsService.deletePlaybooksModelAndResync();
      return res.status(200).json({
        success: true,
        message: 'All data purged successfully',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to purge playbooks and resync',
        error: errorMessage,
      });
    }
  }

  @Get('information/mongodb')
  async getMongoDBStats(@Res() res: Response) {
    try {
      const data = await this.informationService.getMongoDBStats();
      return res.status(200).json({
        success: true,
        message: 'Got MongoDB server stats',
        data,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get MongoDB server stats',
        error: errorMessage,
      });
    }
  }

  @Get('information/redis')
  async getRedisStats(@Res() res: Response) {
    try {
      const data = await this.informationService.getRedisStats();
      return res.status(200).json({
        success: true,
        message: 'Got Redis server stats',
        data,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get Redis server stats',
        error: errorMessage,
      });
    }
  }

  @Get('information/prometheus')
  async getPrometheusStats(@Res() res: Response) {
    try {
      const data = await this.informationService.getPrometheusStats();
      return res.status(200).json({
        success: true,
        message: 'Got Prometheus server stats',
        data,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return res.status(500).json({
        success: false,
        message: 'Failed to get Prometheus server stats',
        error: errorMessage,
      });
    }
  }
}
