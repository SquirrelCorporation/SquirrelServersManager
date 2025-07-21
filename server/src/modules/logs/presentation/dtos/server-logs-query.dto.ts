import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ServerLogsQueryDto {
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  current?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  pageSize?: number;

  @IsOptional()
  @IsString()
  serverId?: string;

  @IsOptional()
  @IsString()
  sortField?: string;

  @IsOptional()
  @IsString()
  sortOrder?: 'ascend' | 'descend';

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  @IsString()
  level?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  pid?: string;
}
