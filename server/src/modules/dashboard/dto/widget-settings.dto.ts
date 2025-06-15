import { IsString, IsArray, IsOptional, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class WidgetSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statistics_type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  statistics_source?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  statistics_metric?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  customText?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customSettings?: Record<string, any>;
}