import { IsNotEmpty, IsUUID } from 'class-validator';

/**
 * DTO for analyzing smart failure request
 */
export class AnalyzeSmartFailureDto {
  /**
   * Execution ID of the Ansible run
   */
  @IsUUID()
  @IsNotEmpty()
  execId!: string;
}

// For backward compatibility
export type SmartFailureRequestDto = AnalyzeSmartFailureDto;
