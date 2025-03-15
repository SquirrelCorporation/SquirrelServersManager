import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * DTO for registry authentication update
 */
export class UpdateRegistryAuthDto {
  @IsObject()
  @IsNotEmpty()
  auth: any;
}

/**
 * DTO for creating a custom registry
 */
export class CreateCustomRegistryDto {
  @IsObject()
  @IsNotEmpty()
  auth: any;

  @IsObject()
  @IsNotEmpty()
  authScheme: any;
}

/**
 * DTO for container registry response
 */
export class ContainerRegistryDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsObject()
  auth?: any;

  @IsOptional()
  @IsObject()
  authScheme?: any;

  @IsString()
  provider: string;

  @IsOptional()
  authSet: boolean;

  @IsOptional()
  canAuth: boolean;

  @IsOptional()
  canAnonymous: boolean;

  @IsOptional()
  @IsString()
  fullName?: string;
}
