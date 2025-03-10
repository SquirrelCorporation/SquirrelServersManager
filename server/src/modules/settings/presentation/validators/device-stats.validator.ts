import { SettingsKeys } from 'ssm-shared-lib';
import { ValidationPipe } from '@nestjs/common';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class DeviceStatsSettingParamDto {
  @IsNotEmpty()
  @IsIn([SettingsKeys.GeneralSettingsKeys.DEVICE_STATS_RETENTION_IN_DAYS])
  key!: string;
}

export class DeviceStatsSettingBodyDto {
  @IsNotEmpty()
  @IsNumber()
  value!: number;
}

export const DeviceStatsSettingsValidator = new ValidationPipe({
  transform: true,
  whitelist: true,
});