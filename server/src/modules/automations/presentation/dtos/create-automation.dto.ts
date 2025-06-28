import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateAutomationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsObject()
  @IsNotEmpty()
  automationChains: any;

  @IsBoolean()
  @IsOptional()
  enabled: boolean = true;
}

export class CreateAutomationBodyDto {
  @IsObject()
  @IsNotEmpty()
  rawChain: any;
}
