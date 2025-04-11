import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { SsmAnsible } from 'ssm-shared-lib';
import { Type } from 'class-transformer';

class TokenDto {
  @IsString()
  @IsOptional()
  token?: string;
}

export class UpdateDeviceAuthDto {
  @IsEnum(SsmAnsible.SSHType)
  @IsOptional()
  authType?: SsmAnsible.SSHType;

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

  @IsString()
  @IsOptional()
  host?: string;

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
}
