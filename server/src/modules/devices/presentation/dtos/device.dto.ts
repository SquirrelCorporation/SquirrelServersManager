import {
  IsBoolean,
  IsEnum,
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SsmAgent, SsmAnsible, SsmStatus } from 'ssm-shared-lib';
// Define all nested DTOs first
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

class DeviceCapabilitiesDto {
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceContainerCapabilitiesDto)
  containers!: DeviceContainerCapabilitiesDto;
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

class DeviceConfigurationDto {
  @IsObject()
  @ValidateNested()
  @Type(() => DeviceContainerConfigurationDto)
  containers!: DeviceContainerConfigurationDto;

  @IsOptional()
  @IsObject()
  systemInformation?: any; // For simplicity, we're not defining the full structure here
}

/*
  authType: string;
  sshPort: number;
  sshKey?: string;
  sshPwd?: string;
  sshUser?: string;
  sshKeyPass?: string;
  sshConnection?: SSHConnection;
  becomeMethod?: string;
  becomePass?: string;
  becomeUser?: string;
  becomeExe?: string;
  becomeFlags?: string;
  strictHostChecking?: boolean;
  sshCommonArgs?: string;
  sshExecutable?: string;
  customDockerSSH?: boolean;
  dockerCustomAuthType?: SSHType;
  dockerCustomSshUser?: string;
  dockerCustomSshPwd?: string;
  dockerCustomSshKeyPass?: string;
  dockerCustomSshKey?: string;
  customDockerForcev6?: boolean;
  customDockerForcev4?: boolean;
  customDockerAgentForward?: boolean;
  customDockerTryKeyboard?: boolean;
  customDockerSocket?: string;
*/
// Now define the main DTOs
export class CreateDeviceDto {
  @IsString()
  ip!: string;

  @IsOptional()
  @IsEnum(SsmAgent.InstallMethods)
  installMethod?: SsmAgent.InstallMethods = SsmAgent.InstallMethods.LESS;

  @IsBoolean()
  @IsOptional()
  unManaged?: boolean = false;

  // SSH
  @IsEnum(SsmAnsible.SSHType)
  @IsNotEmpty()
  authType!: SsmAnsible.SSHType;

  @IsString()
  @IsOptional()
  sshUser?: string;

  @IsString()
  @IsOptional()
  sshKey?: string;

  @IsString()
  @IsOptional()
  sshKeyPass?: string;

  @IsString()
  @IsOptional()
  sshPwd?: string;

  @IsNumber()
  @IsOptional()
  sshPort?: number;

  @IsBoolean()
  @IsOptional()
  strictHostChecking?: boolean;

  // Ansible
  @IsOptional()
  becomeMethod!: string;

  @IsString()
  @IsOptional()
  becomeUser?: string;

  @IsString()
  @IsOptional()
  becomePass?: string;

  @IsEnum(SsmAnsible.SSHConnection)
  @IsOptional()
  sshConnection?: string;
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
  @IsEnum(SsmAgent.InstallMethods)
  agentType?: SsmAgent.InstallMethods;
}
