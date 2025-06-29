import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

// Example nested DTO for simplification
class DeviceAuthDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  username?: string;
}

class DeviceConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableSsh?: boolean;
}

export class DeviceResponseDto {
  @ApiProperty({ description: 'Internal MongoDB ObjectId' })
  @IsString()
  _id!: string;

  @ApiProperty({ description: 'Unique identifier for the device' })
  @IsString()
  uuid!: string;

  @ApiProperty({ description: 'User-friendly name of the device' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Hostname or IP address' })
  @IsOptional()
  @IsString()
  hostname?: string;

  @ApiPropertyOptional({ description: 'Operating system information' })
  @IsOptional()
  @IsString()
  os?: string;

  @ApiPropertyOptional({ description: 'Current status (e.g., online, offline)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Device tags' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: () => DeviceAuthDto, description: 'Authentication details' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceAuthDto)
  auth?: DeviceAuthDto;

  @ApiPropertyOptional({ type: () => DeviceConfigDto, description: 'Configuration settings' })
  @IsOptional()
  @ValidateNested()
  @Type(() => DeviceConfigDto)
  config?: DeviceConfigDto;

  @ApiPropertyOptional({ description: 'Last seen timestamp' })
  @IsOptional()
  @IsDateString()
  lastSeen?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @IsDateString()
  createdAt!: string;

  @ApiProperty({ description: 'Last update timestamp' })
  @IsDateString()
  updatedAt!: string;

  // Add other relevant fields based on your actual Device entity
}
