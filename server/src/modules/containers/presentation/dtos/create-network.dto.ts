import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class DeployNetworkConfigDto {
  @IsString()
  name!: string;

  @IsString()
  network!: string;

  @IsString()
  v4_subnet!: string;

  @IsString()
  v4_gateway!: string;

  @IsString()
  v4_range!: string;

  @IsString()
  @IsOptional()
  v6_subnet?: string;

  @IsString()
  @IsOptional()
  v6_gateway?: string;

  @IsString()
  @IsOptional()
  v6_range?: string;

  @IsArray()
  @IsOptional()
  v4_excludedIps?: string[];

  @IsArray()
  @IsOptional()
  v6_excludedIps?: string[];

  @IsArray()
  @IsOptional()
  labels?: { name: string; value: string }[];
}

/**
 * DTO for creating a new container network
 */
export class DeployNetworkDto {
  @ValidateNested()
  @Type(() => DeployNetworkConfigDto)
  config!: DeployNetworkConfigDto;

  @IsString()
  target!: string;
}
