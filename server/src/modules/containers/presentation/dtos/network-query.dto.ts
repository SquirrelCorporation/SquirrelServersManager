import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class NetworkQueryDto {
  @ApiProperty({ description: 'Current page number', required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  current?: number;

  @ApiProperty({ description: 'Number of items per page', required: false, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number;

  @ApiProperty({ description: 'Sort field', required: false })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({ description: 'Sort order (asc or desc)', required: false })
  @IsOptional()
  @IsString()
  order?: string;

  @ApiProperty({ description: 'Name filter', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Scope filter', required: false })
  @IsOptional()
  @IsString()
  scope?: string;

  @ApiProperty({ description: 'Driver filter', required: false })
  @IsOptional()
  @IsString()
  driver?: string;

  @ApiProperty({ description: 'Device UUID filter', required: false })
  @IsOptional()
  @IsString()
  deviceUuid?: string;

  // Dynamic filter fields
  [key: string]: any;
}
