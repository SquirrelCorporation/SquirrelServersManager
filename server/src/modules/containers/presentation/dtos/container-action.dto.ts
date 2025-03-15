import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { SsmContainer } from 'ssm-shared-lib';

/**
 * DTO for container actions
 */
export class ContainerActionDto {
  /**
   * The action to perform on the container
   */
  @IsString()
  @IsNotEmpty()
  @IsEnum(SsmContainer.Actions)
  action!: SsmContainer.Actions;
}