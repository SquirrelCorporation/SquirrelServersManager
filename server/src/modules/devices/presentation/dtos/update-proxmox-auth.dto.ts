import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SsmProxmox } from 'ssm-shared-lib';

class TokensDto {
  @IsOptional()
  @IsString()
  tokenId?: string;

  @IsOptional()
  @IsString()
  tokenSecret?: string;
}

class UserPwdDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class UpdateProxmoxAuthDto {
  @IsOptional()
  @IsString()
  @IsEnum(SsmProxmox.RemoteConnectionMethod, { message: 'Invalid remoteConnectionMethod' })
  remoteConnectionMethod?: SsmProxmox.RemoteConnectionMethod;

  @IsOptional()
  @IsString()
  @IsEnum(SsmProxmox.ConnectionMethod, { message: 'Invalid connectionMethod' })
  connectionMethod?: SsmProxmox.ConnectionMethod;

  @IsOptional()
  @IsNumber()
  port?: number;

  @IsOptional()
  @IsBoolean()
  ignoreSslErrors?: boolean;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => TokensDto)
  tokens?: TokensDto;

  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserPwdDto)
  userPwd?: UserPwdDto;
}
