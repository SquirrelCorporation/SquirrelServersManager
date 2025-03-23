import {
  IsArray,
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class IpamConfigDto {
  @IsString()
  @IsOptional()
  subnet?: string;

  @IsString()
  @IsOptional()
  gateway?: string;

  @IsString()
  @IsOptional()
  ipRange?: string;
}

class IpamDto {
  @IsString()
  @IsOptional()
  driver?: string = 'default';

  @IsObject()
  @IsOptional()
  options?: Record<string, string>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IpamConfigDto)
  @IsOptional()
  config?: IpamConfigDto[];
}

/**
 * DTO for creating a new container network
 */
export class CreateNetworkDto {
  @IsString()
  name!: string;

  @IsString()
  @IsOptional()
  driver?: string = 'bridge';

  @IsString()
  @IsOptional()
  scope?: string = 'local';

  @ValidateNested()
  @Type(() => IpamDto)
  @IsOptional()
  ipam?: IpamDto;

  @IsBoolean()
  @IsOptional()
  internal?: boolean;

  @IsBoolean()
  @IsOptional()
  enableIPv6?: boolean;

  @IsObject()
  @IsOptional()
  options?: Record<string, string>;

  @IsObject()
  @IsOptional()
  labels?: Record<string, string>;
}
