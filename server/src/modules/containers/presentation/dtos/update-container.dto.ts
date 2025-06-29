import { IsOptional, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateContainerDto } from './create-container.dto';

/**
 * DTO for updating a container
 */
export class UpdateContainerDto extends PartialType(CreateContainerDto) {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  customName?: string;
}
