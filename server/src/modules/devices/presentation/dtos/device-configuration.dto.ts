import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class DockerConfigurationDto {
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

export class ProxmoxConfigurationDto {
  @IsOptional()
  @IsString()
  watchContainersCron?: string;
}

export class SystemInformationConfigurationDto {
  @IsOptional()
  @IsObject()
  system?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  os?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  cpu?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  cpuStats?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  mem?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  memStats?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  networkInterfaces?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  versions?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  usb?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  wifi?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  bluetooth?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  graphics?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  fileSystems?: {
    watch?: boolean;
    cron?: string;
  };

  @IsOptional()
  @IsObject()
  fileSystemsStats?: {
    watch?: boolean;
    cron?: string;
  };
} 