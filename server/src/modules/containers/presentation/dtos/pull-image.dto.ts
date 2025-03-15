import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

/**
 * DTO for pulling an image
 */
export class PullImageDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  tag?: string;
}