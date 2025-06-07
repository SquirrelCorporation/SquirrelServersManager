import { IsBoolean, IsObject, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDeviceCapabilitiesDto {
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceContainerCapabilitiesDto)
  containers!: DeviceContainerCapabilitiesDto;
}

export class DeviceContainerCapabilitiesDto {
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

export class DockerCapabilityDto {
  @IsBoolean()
  enabled!: boolean;
}

export class ProxmoxCapabilityDto {
  @IsBoolean()
  enabled!: boolean;
}

export class LxdCapabilityDto {
  @IsBoolean()
  enabled!: boolean;
}
