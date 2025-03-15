/**
 * @deprecated This DTO is deprecated and will be removed in a future version.
 * Please use the new DTOs in presentation/dtos/container-templates.dto.ts
 */

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

/**
 * DTO for template port
 */
export class TemplatePortDto {
  @IsString()
  host!: string;

  @IsString()
  container!: string;

  @IsString()
  protocol!: string;
}

/**
 * DTO for template volume
 */
export class TemplateVolumeDto {
  @IsString()
  host!: string;

  @IsString()
  container!: string;
}

/**
 * DTO for template deployment
 */
export class TemplateDeployDto {
  @IsString()
  name!: string;

  @IsString()
  image!: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  restart_policy?: string;

  @ValidateNested({ each: true })
  @Type(() => TemplatePortDto)
  ports!: TemplatePortDto[];

  @ValidateNested({ each: true })
  @Type(() => TemplateVolumeDto)
  volumes!: TemplateVolumeDto[];

  @ValidateNested({ each: true })
  @Type(() => TemplateTargetDto)
  targets!: TemplateTargetDto[];
}