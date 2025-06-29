import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { StatsType } from 'ssm-shared-lib';

/**
 * DTO for container stat params
 */
export class ContainerStatParamDto {
  @IsString()
  @IsNotEmpty()
  id!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;
}

/**
 * DTO for container count params
 */
export class ContainerCountParamDto {
  @IsString()
  @IsNotEmpty()
  status!: string;
}

/**
 * DTO for container stats query params
 */
export class ContainerStatsQueryDto {
  @IsString()
  @IsOptional()
  from?: string;
}

/**
 * DTO for container stats type
 */
export class ContainerStatsTypeDto {
  @IsEnum(StatsType.ContainerStatsType)
  type!: StatsType.ContainerStatsType;
}
