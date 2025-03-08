import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class DeviceStatsParamsDto {
  @IsUUID()
  uuid!: string;

  @IsString()
  type!: string;
}

export class DeviceStatsQueryDto {
  @IsDateString()
  @IsOptional()
  from?: string;

  @IsDateString()
  @IsOptional()
  to?: string;
}

export class DeviceStatResponseDto {
  value!: number;
  date?: string;
}

export class DeviceStatsResponseDto {
  date!: string;
  value!: number;
}
