import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateContainerStackRepositoryDto {
  @ApiProperty({ description: 'Name of the repository' })
  @IsString()
  name!: string;

  @ApiProperty({ description: 'URL of the repository' })
  @IsString()
  url!: string;

  @ApiPropertyOptional({ description: 'Description of the repository' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'List of matches for the repository' })
  @IsArray()
  @IsOptional()
  matchesList?: string[];

  @ApiPropertyOptional({ description: 'Access token for the repository' })
  @IsString()
  @IsOptional()
  accessToken?: string;

  @ApiPropertyOptional({ description: 'Branch to use' })
  @IsString()
  @IsOptional()
  branch?: string;

  @ApiPropertyOptional({ description: 'Email associated with the repository' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Username for the repository' })
  @IsString()
  @IsOptional()
  userName?: string;

  @ApiPropertyOptional({ description: 'Remote URL of the repository' })
  @IsString()
  @IsOptional()
  remoteUrl?: string;

  @ApiPropertyOptional({ description: 'Git service being used' })
  @IsString()
  @IsOptional()
  gitService?: string;

  @ApiPropertyOptional({ description: 'Whether to ignore SSL errors' })
  @IsBoolean()
  @IsOptional()
  ignoreSSLErrors?: boolean;

  @ApiPropertyOptional({ description: 'Action to take on error' })
  @IsString()
  @IsOptional()
  onError?: string;

  @ApiPropertyOptional({ description: 'Message to display on error' })
  @IsString()
  @IsOptional()
  onErrorMessage?: string;
}
