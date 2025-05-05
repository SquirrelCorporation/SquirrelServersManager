import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SsmAnsible } from 'ssm-shared-lib';

export class PreCheckRemoteSystemInformationDto {
  @ApiPropertyOptional({
    description: 'IP address of the host to check',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({
    description: 'Authentication type for SSH connection',
    enum: SsmAnsible.SSHType,
    example: SsmAnsible.SSHType.UserPassword,
  })
  @IsOptional()
  @IsEnum(SsmAnsible.SSHType)
  authType?: SsmAnsible.SSHType;

  @ApiPropertyOptional({
    description: 'SSH private key content (if using key-based auth)',
    example: '-----BEGIN RSA PRIVATE KEY-----\n...',
  })
  @IsOptional()
  @IsString()
  sshKey?: string;

  @ApiPropertyOptional({
    description: 'Username for SSH connection',
    example: 'root',
  })
  @IsOptional()
  @IsString()
  sshUser?: string;

  @ApiPropertyOptional({
    description: 'Password for SSH connection (if using password auth)',
    example: 'mysecretpassword',
  })
  @IsOptional()
  @IsString()
  sshPwd?: string;

  @ApiPropertyOptional({
    description: 'Port number for SSH connection',
    example: 22,
  })
  @IsOptional()
  @IsNumber()
  sshPort?: number;

  @ApiPropertyOptional({
    description: 'Method for privilege escalation (e.g., sudo, su)',
    enum: SsmAnsible.AnsibleBecomeMethod,
    example: SsmAnsible.AnsibleBecomeMethod.SUDO,
  })
  @IsOptional()
  @IsEnum(SsmAnsible.AnsibleBecomeMethod)
  becomeMethod?: SsmAnsible.AnsibleBecomeMethod;

  @ApiPropertyOptional({
    description: 'Password for privilege escalation (if required)',
    example: 'becomepassword',
  })
  @IsOptional()
  @IsString()
  becomePass?: string;

  @ApiPropertyOptional({
    description: 'Password for the SSH private key (if encrypted)',
    example: 'keypassword',
  })
  @IsOptional()
  @IsString()
  sshKeyPass?: string;
}
