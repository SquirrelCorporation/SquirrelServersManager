import { SettingsKeys } from 'ssm-shared-lib';
import { ValidationPipe } from '@nestjs/common';
import { IsIn, IsNotEmpty, IsNumber } from 'class-validator';

export class DevicesSettingParamDto {
  @IsNotEmpty()
  @IsIn(Object.values(SettingsKeys.GeneralSettingsKeys))
  key!: string;
}

export class DevicesSettingBodyDto {
  @IsNotEmpty()
  @IsNumber()
  value!: number;
}

export const DevicesSettingsValidator = new ValidationPipe({
  transform: true,
  whitelist: true,
});