import { IsArray, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class CreateContainerDto {
  @IsNotEmpty()
  @IsString()
  deviceId!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  image!: string;

  @IsOptional()
  @IsString()
  command?: string;

  @IsOptional()
  @IsObject()
  ports?: Record<string, any>;

  @IsOptional()
  @IsArray()
  volumes?: string[];

  @IsOptional()
  @IsArray()
  networks?: string[];

  @IsOptional()
  @IsObject()
  environment?: Record<string, string>;

  @IsOptional()
  @IsObject()
  labels?: Record<string, string>;
}