/**
 * @deprecated This DTO is deprecated and will be removed in a future version.
 * Please use the new ContainerLogsDto in presentation/dtos/container-logs.dto.ts
 */

import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class ContainerLogsDto {
  @IsString()
  containerId!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  from?: number;
}