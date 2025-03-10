import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO for smart failure request
 */
export class SmartFailureRequestDto {
  /**
   * Execution ID of the Ansible run
   */
  @IsUUID()
  @IsNotEmpty()
  execId!: string;
}
