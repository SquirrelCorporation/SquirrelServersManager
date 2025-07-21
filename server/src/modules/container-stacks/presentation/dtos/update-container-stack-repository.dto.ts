import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { SsmGit } from 'ssm-shared-lib';

export class UpdateContainerStackRepositoryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  url?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  matchesList?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accessToken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branch?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  userName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  remoteUrl?: string;

  @ApiPropertyOptional({ enum: SsmGit.Services })
  @IsOptional()
  @IsEnum(SsmGit.Services)
  gitService?: SsmGit.Services;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  ignoreSSLErrors?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  onError?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  onErrorMessage?: string;
}
