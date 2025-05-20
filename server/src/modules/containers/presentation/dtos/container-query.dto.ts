import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for container query parameters
 */
export class ContainersQueryDto {
  @ApiPropertyOptional({
    description: 'Current page number',
    type: Number,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  current?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    type: Number,
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Filter by container status',
    type: [String],
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  'status[]'?: string[];

  @ApiPropertyOptional({
    description: 'Filter by container name',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by update availability',
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  updateAvailable?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by device UUID',
    type: String,
  })
  @IsOptional()
  @IsString()
  deviceUuid?: string;

  // Any other query params
  [key: string]: any;
}
