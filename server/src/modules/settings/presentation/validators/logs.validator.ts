import { SettingsKeys } from 'ssm-shared-lib';
import { ValidationPipe } from '@nestjs/common';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class LogsSettingParamDto {
  @IsNotEmpty()
  @IsIn(Object.values(SettingsKeys.GeneralSettingsKeys))
  key!: string;
}

export class LogsSettingBodyDto {
  @IsNotEmpty()
  @IsNumber()
  value!: number;
}

export const LogsSettingsValidator = new ValidationPipe({
  transform: true,
  whitelist: true,
});