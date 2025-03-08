import { IsBoolean, IsIn, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

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
  @IsIn(['agent', 'tunnel', 'ssh'], { message: 'Invalid remoteConnectionMethod' })
  remoteConnectionMethod?: 'agent' | 'tunnel' | 'ssh';

  @IsOptional()
  @IsString()
  @IsIn(['ssh', 'https'], { message: 'Invalid connectionMethod' })
  connectionMethod?: 'ssh' | 'https';

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