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