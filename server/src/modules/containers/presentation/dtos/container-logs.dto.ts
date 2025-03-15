import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for container logs requests
 */
export class ContainerLogsDto {
  @IsString()
  containerId!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  from?: number;
}