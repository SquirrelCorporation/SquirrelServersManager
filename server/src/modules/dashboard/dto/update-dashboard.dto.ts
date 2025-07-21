import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateDashboardDto } from './create-dashboard.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDashboardDto extends PartialType(CreateDashboardDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastModifiedBy?: string;
}