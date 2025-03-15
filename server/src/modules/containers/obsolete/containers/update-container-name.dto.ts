import { IsNotEmpty, IsString } from 'class-validator';

/**
 * DTO for updating a container's custom name
 */
export class UpdateContainerNameDto {
  /**
   * The new custom name for the container
   */
  @IsString()
  @IsNotEmpty()
  customName!: string;
}