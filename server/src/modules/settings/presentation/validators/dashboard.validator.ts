import { SettingsKeys } from 'ssm-shared-lib';
import { ValidationPipe } from '@nestjs/common';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class DashboardSettingParamDto {
  @IsNotEmpty()
  @IsIn(Object.values(SettingsKeys.GeneralSettingsKeys))
  key!: string;
}

export class DashboardSettingBodyDto {
  @IsNotEmpty()
  @IsNumber()
  value!: number;
}

export const DashboardSettingsValidator = new ValidationPipe({
  transform: true,
  whitelist: true,
});