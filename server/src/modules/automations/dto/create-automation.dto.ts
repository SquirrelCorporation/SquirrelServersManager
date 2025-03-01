import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAutomationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @Transform(({ value }) => value.trim())
  name: string = '';

  @IsObject()
  @IsNotEmpty()
  @Type(() => Object)
  automationChains: any;

  @IsBoolean()
  @IsOptional()
  enabled: boolean = true;
}
