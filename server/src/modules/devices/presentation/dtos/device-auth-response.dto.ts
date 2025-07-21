import { ApiProperty } from '@nestjs/swagger';
import { SsmAnsible, SsmProxmox } from 'ssm-shared-lib';
import { IDeviceAuth } from '../../domain/entities/device-auth.entity';

export class ProxmoxAuthDto {
  @ApiProperty({
    description: 'Remote connection method',
    example: 'ssh',
  })
  remoteConnectionMethod!: SsmProxmox.RemoteConnectionMethod;

  @ApiProperty({
    description: 'Connection method',
    example: 'ssh',
  })
  connectionMethod!: SsmProxmox.ConnectionMethod;

  @ApiProperty({
    description: 'Whether to ignore SSL errors',
    example: false,
    type: Boolean,
  })
  ignoreSslErrors = false;

  @ApiProperty({
    description: 'Whether to use SSL',
    example: true,
    type: Boolean,
  })
  useSSL = true;
}

export class DeviceAuthResponseDto implements IDeviceAuth {
  @ApiProperty({
    description: 'Device reference',
    example: '507f1f77bcf86cd799439011',
  })
  device!: string;

  @ApiProperty({
    description: 'Authentication type',
    example: 'proxmox',
  })
  authType!: SsmAnsible.SSHType;

  @ApiProperty({
    description: 'SSH username',
    example: 'root',
  })
  sshUser!: string;

  @ApiProperty({
    description: 'SSH password',
    example: 'REDACTED',
  })
  sshPwd?: string;

  @ApiProperty({
    description: 'SSH key',
    example: 'REDACTED',
  })
  sshKey?: string;

  @ApiProperty({
    description: 'Proxmox authentication details',
    type: () => ProxmoxAuthDto,
  })
  proxmoxAuth!: ProxmoxAuthDto;

  @ApiProperty({
    description: 'Docker authentication details',
    type: Object,
  })
  dockerAuth?: Record<string, any>;
}
