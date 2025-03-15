/**
 * @deprecated This file is deprecated and will be removed in future versions.
 * Please use the implementation in presentation/dtos/container-stats.dto.ts instead.
 * This file is kept for backward compatibility during migration.
 */

import { IsEnum, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { SsmStatus, StatsType } from 'ssm-shared-lib';

/**
 * DTO for container stat by ID and type
 */
export class ContainerStatParamDto {
  @IsString()
  id!: string;

  @IsString()
  @IsEnum(StatsType.ContainerStatsType)
  type!: string;
}

/**
 * DTO for container stats by ID and type with from parameter
 */
export class ContainerStatsQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  from?: number = 24;
}

/**
 * DTO for container count by status
 */
export class ContainerCountParamDto {
  @IsString()
  @IsIn([...Object.values(SsmStatus.ContainerStatus), 'all'])
  status!: string;
}