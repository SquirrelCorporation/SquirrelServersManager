import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateAutomationDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsObject()
  @IsNotEmpty()
  @IsOptional()
  automationChains?: any;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class UpdateAutomationBodyDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsObject()
  @IsNotEmpty()
  rawChain: any;
}
