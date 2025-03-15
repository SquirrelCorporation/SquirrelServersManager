/**
 * @deprecated OBSOLETE FILE - DO NOT USE IN NEW CODE
 * This file is kept for reference only during migration to clean architecture.
 * Please use the new implementation in presentation/dtos/container-stats.dto.ts
 */

import { IsEnum, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { StatsType } from 'ssm-shared-lib';

/**
 * DTO for container stat params
 */
export class ContainerStatParamDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

/**
 * DTO for container count params
 */
export class ContainerCountParamDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}

/**
 * DTO for container stats query params
 */
export class ContainerStatsQueryDto {
  @IsInt()
  @Min(1)
  @Type(() => Number)
  from: number;
}

/**
 * DTO for container stats type
 */
export class ContainerStatsTypeDto {
  @IsEnum(StatsType.ContainerStatsType)
  type: StatsType.ContainerStatsType;
}