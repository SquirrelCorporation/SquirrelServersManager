import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * DTO for building an image
 */
export class BuildImageDto {
  @IsString()
  @IsNotEmpty()
  dockerfile!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  tag!: string;

  @IsString()
  @IsNotEmpty()
  buildContext!: string;

  @IsObject()
  @IsOptional()
  buildArgs?: Record<string, string>;
}