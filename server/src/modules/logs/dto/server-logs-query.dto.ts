import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { API } from 'ssm-shared-lib';

export class ServerLogsQueryDto implements API.PageParams, Partial<API.ServerLog> {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  current?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  @IsOptional()
  @IsString()
  time?: string;

  @IsOptional()
  @IsNumber()
  pid?: number;

  @IsOptional()
  @IsNumber()
  level?: number;

  @IsOptional()
  @IsString()
  msg?: string;

  @IsOptional()
  @IsString()
  module?: string;

  @IsOptional()
  @IsString()
  moduleId?: string;

  @IsOptional()
  @IsString()
  moduleName?: string;

  @IsOptional()
  sorter?: any;

  @IsOptional()
  filter?: any;

  constructor() {
    // Set default values in the constructor
    this.current = 1;
    this.pageSize = 10;
  }
}
