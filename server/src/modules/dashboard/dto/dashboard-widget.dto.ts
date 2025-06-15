import { IsString, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { WidgetSettingsDto } from './widget-settings.dto';

export class DashboardWidgetDto {
  @ApiProperty()
  @IsString()
  id!: string;

  @ApiProperty()
  @IsString()
  widgetType!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  size!: string;

  @ApiProperty()
  @IsNumber()
  position!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => WidgetSettingsDto)
  settings?: WidgetSettingsDto;
}