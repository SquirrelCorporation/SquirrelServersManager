import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for tagging an image
 */
export class TagImageDto {
  @IsString()
  @IsNotEmpty()
  newName: string;

  @IsString()
  @IsNotEmpty()
  newTag: string;
}