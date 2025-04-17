import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ApiStandardResponse } from '@infrastructure/decorators/api-standard-response.decorator';
import { MongoDBStatsDto, PrometheusStatsDto, RedisStatsDto } from '../dtos/stats.dto';

export const SETTINGS_TAG = 'Settings';

export function UpdateDashboardSettingDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update dashboard setting',
      description: 'Update a specific dashboard setting by key',
    }),
    ApiParam({
      name: 'key',
      description: 'Dashboard setting key to update',
      type: 'string',
      enum: ['considerPerformanceGoodCpuIfLower', 'considerPerformanceGoodMemIfGreater'],
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            description: 'New value for the setting',
          },
        },
      },
    }),
    ApiStandardResponse(),
  );
}

export function UpdateDevicesSettingDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update devices setting',
      description: 'Update a specific devices setting by key',
    }),
    ApiParam({
      name: 'key',
      description: 'Devices setting key to update',
      type: 'string',
      enum: ['considerDeviceOfflineAfterInMinutes'],
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            description: 'New value for the setting',
          },
        },
      },
    }),
    ApiStandardResponse(),
  );
}

export function UpdateLogsSettingDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update logs setting',
      description: 'Update a specific logs setting by key',
    }),
    ApiParam({
      name: 'key',
      description: 'Logs setting key to update',
      type: 'string',
      enum: ['cleanUpAnsibleStatusesAndTasksAfterInSeconds', 'serverLogRetentionInDays'],
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            description: 'New value for the setting',
          },
        },
      },
    }),
    ApiStandardResponse(),
  );
}

export function UpdateDeviceStatsSettingDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update device stats setting',
      description: 'Update a specific device stats setting by key',
    }),
    ApiParam({
      name: 'key',
      description: 'Device stats setting key to update',
      type: 'string',
      enum: ['deviceStatsRetentionInDays'],
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          value: {
            type: 'number',
            description: 'New value for the setting',
          },
        },
      },
    }),
    ApiStandardResponse(),
  );
}

export function UpdateMasterNodeUrlDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Update master node URL',
      description: 'Update the master node URL setting',
    }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          value: {
            type: 'string',
            description: 'New master node URL',
          },
        },
      },
    }),
    ApiStandardResponse(),
  );
}

export function RestartServerDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Restart server',
      description: 'Restart the Squirrel Servers Manager server',
    }),
    ApiStandardResponse(),
  );
}

export function DeleteLogsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete logs',
      description: 'Delete all server logs',
    }),
    ApiStandardResponse(),
  );
}

export function DeleteAnsibleLogsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete Ansible logs',
      description: 'Delete all Ansible logs',
    }),
    ApiStandardResponse(),
  );
}

export function DeletePlaybooksAndResyncDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Delete playbooks and resync',
      description: 'Delete all playbooks and trigger a resync',
    }),
    ApiStandardResponse(),
  );
}

export function GetMongoDBStatsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get MongoDB stats',
      description: 'Get MongoDB database statistics',
    }),
    ApiStandardResponse(MongoDBStatsDto),
  );
}

export function GetRedisStatsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Redis stats',
      description: 'Get Redis server statistics',
    }),
    ApiStandardResponse(RedisStatsDto),
  );
}

export function GetPrometheusStatsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get Prometheus stats',
      description: 'Get Prometheus server statistics',
    }),
    ApiStandardResponse(PrometheusStatsDto),
  );
}
