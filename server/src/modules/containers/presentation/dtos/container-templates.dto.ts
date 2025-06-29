import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for container templates query parameters
 */
export class ContainerTemplatesQueryDto {
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

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  categories?: string;
}

/**
 * DTO for template target
 */
export class TemplateTargetDto {
  @IsString()
  id!: string;
}
