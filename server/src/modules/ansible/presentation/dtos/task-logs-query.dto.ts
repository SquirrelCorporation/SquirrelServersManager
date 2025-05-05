import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class TaskLogsQueryDto {
  @IsOptional()
  @IsNumberString()
  current?: string;

  @IsOptional()
  @IsNumberString()
  pageSize?: string;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  order?: SortOrder;

  @IsOptional()
  @IsString()
  ident?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  cmd?: string;

  // Additional fields for filtering
  @IsOptional()
  @IsString()
  sorter?: string;

  @IsOptional()
  @IsString()
  filter?: string;
}