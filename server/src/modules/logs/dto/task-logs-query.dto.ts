import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString } from 'class-validator';
import { API } from 'ssm-shared-lib';

export class TaskLogsQueryDto implements API.PageParams, Partial<API.Task> {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  current?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  ident?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  cmd?: string;

  @IsOptional()
  @IsString()
  createdAt?: string;

  @IsOptional()
  @IsString()
  updatedAt?: string;

  @IsOptional()
  sorter?: any;

  @IsOptional()
  filter?: any;
}
