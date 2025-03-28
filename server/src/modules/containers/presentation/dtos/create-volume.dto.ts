import { IsBoolean, IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

/**
 * DTO for creating a new volume
 */
export class CreateVolumeDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  driver?: string;

  @IsObject()
  @IsOptional()
  driver_opts?: Record<string, string>;

  @IsObject()
  @IsOptional()
  labels?: Record<string, string>;
}
