import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsObject, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateAutomationDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }) => value?.trim())
  name?: string;

  @IsObject()
  @IsOptional()
  @Type(() => Object)
  automationChains?: any;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}
