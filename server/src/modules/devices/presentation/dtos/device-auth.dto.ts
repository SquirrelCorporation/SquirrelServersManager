import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SsmAnsible } from 'ssm-shared-lib';
import { Type } from 'class-transformer';


class TokenDto {
  @IsString()
  @IsOptional()
  token?: string;
}

class SshDto {
  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  sshKey?: string;

  @IsString()
  @IsOptional()
  sshKeyPass?: string;

  @IsString()
  @IsOptional()
  sshPwd?: string;

  @IsString()
  @IsOptional()
  host?: string;

  @IsString()
  @IsOptional()
  port?: string;

  @IsString()
  @IsOptional()
  becomeMethod?: string;

  @IsString()
  @IsOptional()
  becomeUser?: string;

  @IsString()
  @IsOptional()
  becomePass?: string;
}

export class CreateDeviceAuthDto {
  @IsEnum(SsmAnsible.SSHType)
  @IsNotEmpty()
  authType!: SsmAnsible.SSHType;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  sshKey?: string;

  @IsString()
  @IsOptional()
  sshKeyPass?: string;

  @IsString()
  @IsOptional()
  sshPwd?: string;

  @IsString()
  @IsOptional()
  host?: string;

  @IsString()
  @IsOptional()
  port?: string;

  @IsEnum(SsmAnsible.AnsibleBecomeMethod)
  @IsOptional()
  becomeMethod?: SsmAnsible.AnsibleBecomeMethod;

  @IsString()
  @IsOptional()
  becomeUser?: string;

  @IsString()
  @IsOptional()
  becomePass?: string;

  @ValidateNested()
  @Type(() => TokenDto)
  @IsOptional()
  token?: TokenDto;

  @ValidateNested()
  @Type(() => SshDto)
  @IsOptional()
  ssh?: SshDto;
}

export class UpdateDeviceAuthDto {
  @IsEnum(SsmAnsible.SSHType)
  @IsOptional()
  authType?: SsmAnsible.SSHType;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  sshKey?: string;

  @IsString()
  @IsOptional()
  sshKeyPass?: string;

  @IsString()
  @IsOptional()
  sshPwd?: string;

  @IsString()
  @IsOptional()
  host?: string;

  @IsString()
  @IsOptional()
  port?: string;

  @IsEnum(SsmAnsible.AnsibleBecomeMethod)
  @IsOptional()
  becomeMethod?: SsmAnsible.AnsibleBecomeMethod;

  @IsString()
  @IsOptional()
  becomeUser?: string;

  @IsString()
  @IsOptional()
  becomePass?: string;

  @ValidateNested()
  @Type(() => TokenDto)
  @IsOptional()
  token?: TokenDto;

  @ValidateNested()
  @Type(() => SshDto)
  @IsOptional()
  ssh?: SshDto;
}