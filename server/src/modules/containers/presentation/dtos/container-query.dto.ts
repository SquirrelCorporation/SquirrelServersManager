import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for container query parameters
 */
export class ContainersQueryDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  current?: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Transform(({ value }) => parseInt(value, 10))
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  sorter?: string;

  @IsOptional()
  @IsString()
  filter?: string;

  // Any other query params
  [key: string]: any;
}
