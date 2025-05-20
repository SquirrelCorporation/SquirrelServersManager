import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateContainerStackDto {
  @ApiProperty({ description: 'Name of the container stack' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ description: 'Description of the container stack' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'Path to the stack files' })
  @IsString()
  @IsOptional()
  path?: string;

  @ApiPropertyOptional({ description: 'YAML content of the stack' })
  @IsString()
  @IsOptional()
  yaml?: string;

  @ApiPropertyOptional({ description: 'Icon for the stack' })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiPropertyOptional({ description: 'Icon color' })
  @IsString()
  @IsOptional()
  iconColor?: string;

  @ApiPropertyOptional({ description: 'Icon background color' })
  @IsString()
  @IsOptional()
  iconBackgroundColor?: string;

  @ApiPropertyOptional({ description: 'Whether to lock JSON' })
  @IsBoolean()
  @IsOptional()
  lockJson?: boolean;
}
