import { IsBoolean, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class PortBinding {
  @IsString()
  hostIp?: string;

  @IsString()
  hostPort?: string;
}

class PortMap {
  @ValidateNested({ each: true })
  @Type(() => PortBinding)
  @IsOptional()
  bindings?: PortBinding[];
}

class VolumeMount {
  @IsString()
  source!: string;

  @IsString()
  target!: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsBoolean()
  @IsOptional()
  readonly?: boolean;
}

class NetworkConfig {
  @IsString()
  name!: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}

export class CreateContainerDto {
  @IsString()
  name!: string;

  @IsString()
  image!: string;

  @IsObject()
  @IsOptional()
  env?: Record<string, string>;

  @IsObject()
  @IsOptional()
  ports?: Record<string, PortMap>;

  @ValidateNested({ each: true })
  @Type(() => VolumeMount)
  @IsOptional()
  volumes?: VolumeMount[];

  @ValidateNested({ each: true })
  @Type(() => NetworkConfig)
  @IsOptional()
  networks?: NetworkConfig[];

  @IsString()
  @IsOptional()
  command?: string;

  @IsObject()
  @IsOptional()
  labels?: Record<string, string>;

  @IsString()
  @IsOptional()
  restart?: string;

  @IsBoolean()
  @IsOptional()
  privileged?: boolean;
}
