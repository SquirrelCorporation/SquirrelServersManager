import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SettingsKeys, SsmAnsible } from 'ssm-shared-lib';
import {
  ACTIONS,
  RESOURCES,
  ResourceAction,
} from '../../../../infrastructure/security/roles/resource-action.decorator';
import { AdvancedOperationsService } from '../../application/services/advanced-operations.service';
import { InformationService } from '../../application/services/information.service';
import {
  ISettingsService,
  SETTINGS_SERVICE,
} from '../../domain/interfaces/settings-service.interface';
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
import {
  DeleteAnsibleLogsDoc,
  DeleteLogsDoc,
  DeletePlaybooksAndResyncDoc,
  GetMongoDBStatsDoc,
  GetPrometheusStatsDoc,
  GetRedisStatsDoc,
  RestartServerDoc,
  SETTINGS_TAG,
  UpdateDashboardSettingDoc,
  UpdateDeviceStatsSettingDoc,
  UpdateDevicesSettingDoc,
  UpdateLogsSettingDoc,
  UpdateMasterNodeUrlDoc,
} from '../decorators/settings.decorators';

/**
 * Settings Controller
 *
 * This controller handles operations related to system settings, including
 * updating various settings and performing advanced operations.
 */
@ApiTags(SETTINGS_TAG)
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
  @UpdateDashboardSettingDoc()
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
        return;
      case SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER:
        await this.settingsService.setSetting(
          SettingsKeys.GeneralSettingsKeys.CONSIDER_PERFORMANCE_GOOD_MEM_IF_GREATER,
          value.toString(),
        );
        return;
      default:
        throw new InternalServerErrorException('Unknown key');
    }
  }

  @Post('devices/:key')
  @UsePipes(DevicesSettingsValidator)
  @UpdateDevicesSettingDoc()
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
        return;
      default:
        throw new InternalServerErrorException('Unknown key');
    }
  }

  @Post('logs/:key')
  @UsePipes(LogsSettingsValidator)
  @UpdateLogsSettingDoc()
  async updateLogsSetting(@Param() params: LogsSettingParamDto, @Body() body: LogsSettingBodyDto) {
    const { key } = params;
    const { value } = body;

    switch (key) {
      case SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS:
        await this.settingsService.setSetting(
          SettingsKeys.GeneralSettingsKeys.CLEAN_UP_ANSIBLE_STATUSES_AND_TASKS_AFTER_IN_SECONDS,
          value.toString(),
        );
        return;
      case SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS:
        await this.settingsService.setSetting(
          SettingsKeys.GeneralSettingsKeys.SERVER_LOG_RETENTION_IN_DAYS,
          value.toString(),
        );
        return;
      default:
        throw new InternalServerErrorException('Unknown key');
    }
  }

  @Post('device-stats/:key')
  @UsePipes(DeviceStatsSettingsValidator)
  @UpdateDeviceStatsSettingDoc()
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
        return;
      default:
        throw new InternalServerErrorException('Unknown key');
    }
  }

  @Post('keys/master-node-url')
  @UsePipes(MasterNodeUrlValidator)
  @UpdateMasterNodeUrlDoc()
  async updateMasterNodeUrl(@Body() body: MasterNodeUrlBodyDto) {
    await this.settingsService.setSetting(
      SsmAnsible.DefaultSharedExtraVarsList.MASTER_NODE_URL,
      body.value,
    );
    return body.value;
  }

  @Post('advanced/restart')
  @ResourceAction(RESOURCES.SETTING, ACTIONS.EXECUTE)
  @RestartServerDoc()
  async restartServer() {
    try {
      await this.advancedOperationsService.restartServer();
      return;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException('Failed to restart server', errorMessage);
    }
  }

  @Delete('advanced/logs')
  @ResourceAction(RESOURCES.SETTING, ACTIONS.DELETE)
  @DeleteLogsDoc()
  async deleteLogs() {
    try {
      await this.advancedOperationsService.deleteLogs();
      return;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException('Failed to purge logs', errorMessage);
    }
  }

  @Delete('advanced/ansible-logs')
  @ResourceAction(RESOURCES.SETTING, ACTIONS.DELETE)
  @DeleteAnsibleLogsDoc()
  async deleteAnsibleLogs() {
    try {
      await this.advancedOperationsService.deleteAnsibleLogs();
      return;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException('Failed to purge Ansible logs', errorMessage);
    }
  }

  @Delete('advanced/playbooks-and-resync')
  @ResourceAction(RESOURCES.SETTING, ACTIONS.DELETE)
  @DeletePlaybooksAndResyncDoc()
  async deletePlaybooksAndResync() {
    try {
      await this.advancedOperationsService.deletePlaybooksModelAndResync();
      return;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException('Failed to purge playbooks and resync', errorMessage);
    }
  }

  @Get('information/mongodb')
  @GetMongoDBStatsDoc()
  async getMongoDBStats() {
    try {
      const data = await this.informationService.getMongoDBStats();
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException('Failed to get MongoDB server stats', errorMessage);
    }
  }

  @Get('information/redis')
  @GetRedisStatsDoc()
  async getRedisStats() {
    try {
      const data = await this.informationService.getRedisStats();
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException('Failed to get Redis server stats', errorMessage);
    }
  }

  @Get('information/prometheus')
  @GetPrometheusStatsDoc()
  async getPrometheusStats() {
    try {
      const data = await this.informationService.getPrometheusStats();
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new InternalServerErrorException('Failed to get Prometheus server stats', errorMessage);
    }
  }
}
