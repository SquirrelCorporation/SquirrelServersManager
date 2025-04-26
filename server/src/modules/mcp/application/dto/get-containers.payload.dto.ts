import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class GetContainersPayloadDto {
  @ApiPropertyOptional({
    description: 'Number of items to return per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Page number to retrieve',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Search term to filter containers by (e.g., name, image)',
    example: 'nginx-proxy',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'name',
  })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({
    description: "Sort order ('asc' or 'desc')",
    enum: ['asc', 'desc'],
    default: 'asc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'asc';

  // Add other potential filter fields as needed (e.g., status, deviceId)
  // @ApiPropertyOptional({ description: 'Filter by status', example: 'running' })
  // @IsOptional()
  // @IsString()
  // status?: string;

  // @ApiPropertyOptional({ description: 'Filter by device ID', example: '605cdd7a3e6f1a001f1b6a5f' })
  // @IsOptional()
  // @IsMongoId()
  // deviceId?: string;
}
