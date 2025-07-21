import { IsString, IsArray, IsOptional, IsBoolean, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { DashboardPageDto } from './dashboard-page.dto';

export class CreateDashboardDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ type: [DashboardPageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DashboardPageDto)
  pages!: DashboardPageDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isSystem?: boolean;
}