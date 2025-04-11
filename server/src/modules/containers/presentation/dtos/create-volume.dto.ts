import { IsNotEmpty, IsObject, IsString } from 'class-validator';

/**
 * DTO for creating a new volume
 */
export class CreateVolumeDto {
  @IsObject()
  @IsNotEmpty()
  config!: string;

  @IsString()
  @IsNotEmpty()
  target!: string;
}
