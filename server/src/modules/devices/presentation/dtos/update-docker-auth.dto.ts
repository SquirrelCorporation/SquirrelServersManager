import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { SsmAnsible } from 'ssm-shared-lib';

export class UpdateDockerAuthDto {
  @IsEnum(SsmAnsible.SSHType)
  @IsOptional()
  dockerCustomAuthType?: SsmAnsible.SSHType;

  @IsString()
  @IsOptional()
  dockerHost?: string;

  @IsString()
  @IsOptional()
  dockerPort?: string;

  @IsString()
  @IsOptional()
  dockerCustomSshUser?: string;

  @IsString()
  @IsOptional()
  dockerCustomSshPwd?: string;

  @IsString()
  @IsOptional()
  dockerCustomSshKey?: string;

  @IsString()
  @IsOptional()
  dockerCustomSshKeyPass?: string;

  @IsBoolean()
  @IsOptional()
  dockerCustomSshIgnoreSslErrors?: boolean;

  @IsBoolean()
  @IsOptional()
  customDockerSSH?: boolean;

  @IsBoolean()
  @IsOptional()
  customDockerForcev6?: boolean;

  @IsBoolean()
  @IsOptional()
  customDockerForcev4?: boolean;

  @IsBoolean()
  @IsOptional()
  customDockerAgentForward?: boolean;

  @IsBoolean()
  @IsOptional()
  customDockerTryKeyboard?: boolean;

  @IsString()
  @IsOptional()
  customDockerSocket?: string;

  // We don't include the certificate files (dockerCa, dockerCert, dockerKey)
  // as they are handled by the file upload endpoint
}
