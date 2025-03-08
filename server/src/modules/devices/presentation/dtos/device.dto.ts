import { IsBoolean, IsEnum, IsIP, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SsmStatus } from 'ssm-shared-lib';

export class CreateDeviceDto {
  @IsString()
  @IsNotEmpty()
  uuid!: string;

  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @IsObject()
  @ValidateNested()
  @Type(() => DeviceCapabilitiesDto)
  capabilitie!: DeviceCapabilitiesDto;

  @IsObject()
  @ValidateNested()
  @Type(() => DeviceConfigurationDto)
  configuration!: DeviceConfigurationDto;

  @IsOptional()
  @IsString()
  dockerVersion?: string;

  @IsOptional()
  @IsString()
  dockerId?: string;

  @IsOptional()
  @IsString()
  hostname?: string;

  @IsOptional()
  @IsString()
  fqdn?: string;

  @IsEnum(SsmStatus.DeviceStatus)
  status!: number;

  @IsOptional()
  @IsIP()
  ip?: string;

  @IsOptional()
  @IsString()
  agentVersion?: string;

  @IsOptional()
  @IsString()
  agentLogPath?: string;

  @IsOptional()
  @IsEnum(['node', 'docker', 'less'])
  agentType?: 'node' | 'docker' | 'less';
}

export class UpdateDeviceDto {
  @IsOptional()
  @IsBoolean()
  disabled?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceCapabilitiesDto)
  capabilities?: DeviceCapabilitiesDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceConfigurationDto)
  configuration?: DeviceConfigurationDto;

  @IsOptional()
  @IsString()
  dockerVersion?: string;

  @IsOptional()
  @IsString()
  dockerId?: string;

  @IsOptional()
  @IsString()
  hostname?: string;

  @IsOptional()
  @IsString()
  fqdn?: string;

  @IsOptional()
  @IsEnum(SsmStatus.DeviceStatus)
  status?: number;

  @IsOptional()
  @IsIP()
  ip?: string;

  @IsOptional()
  @IsString()
  agentVersion?: string;

  @IsOptional()
  @IsString()
  agentLogPath?: string;

  @IsOptional()
  @IsEnum(['node', 'docker', 'less'])
  agentType?: 'node' | 'docker' | 'less';
}

class DeviceCapabilitiesDto {
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceContainerCapabilitiesDto)
  containers!: DeviceContainerCapabilitiesDto;
}

class DeviceContainerCapabilitiesDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => DockerCapabilityDto)
  docker?: DockerCapabilityDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ProxmoxCapabilityDto)
  proxmox?: ProxmoxCapabilityDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LxdCapabilityDto)
  lxd?: LxdCapabilityDto;
}

class DockerCapabilityDto {
  @IsBoolean()
  enabled!: boolean;
}

class ProxmoxCapabilityDto {
  @IsBoolean()
  enabled!: boolean;
}

class LxdCapabilityDto {
  @IsBoolean()
  enabled!: boolean;
}

class DeviceConfigurationDto {
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceContainerConfigurationDto)
  containers!: DeviceContainerConfigurationDto;

  @IsOptional()
  @IsObject()
  systemInformation?: any; // For simplicity, we're not defining the full structure here
}

class DeviceContainerConfigurationDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => ProxmoxConfigurationDto)
  proxmox?: ProxmoxConfigurationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DockerConfigurationDto)
  docker?: DockerConfigurationDto;
}

class ProxmoxConfigurationDto {
  @IsOptional()
  @IsString()
  watchContainersCron?: string;
}

class DockerConfigurationDto {
  @IsOptional()
  @IsBoolean()
  watchContainers?: boolean;

  @IsOptional()
  @IsString()
  watchContainersCron?: string;

  @IsOptional()
  @IsBoolean()
  watchContainersStats?: boolean;

  @IsOptional()
  @IsString()
  watchContainersStatsCron?: string;

  @IsOptional()
  @IsBoolean()
  watchEvents?: boolean;

  @IsOptional()
  @IsBoolean()
  watchAll?: boolean;
}