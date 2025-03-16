import { Automation } from '../../domain/entities/automation.entity';
import { CreateAutomationDto } from '../../presentation/dtos/create-automation.dto';
import { UpdateAutomationDto } from '../../presentation/dtos/update-automation.dto';

export const AUTOMATIONS_SERVICE = 'AUTOMATIONS_SERVICE';

/**
 * Interface for the Automations Service
 */
export interface IAutomationsService {
  /**
   * Find all automations
   * @returns List of all automations
   */
  findAll(): Promise<Automation[]>;

  /**
   * Find all enabled automations
   * @returns List of enabled automations
   */
  findAllEnabled(): Promise<Automation[]>;

  /**
   * Find an automation by UUID
   * @param uuid Automation UUID
   * @returns Automation or null if not found
   */
  findByUuid(uuid: string): Promise<Automation | null>;

  /**
   * Create a new automation
   * @param createAutomationDto Data for creating the automation
   * @returns Created automation
   */
  create(createAutomationDto: CreateAutomationDto): Promise<Automation>;

  /**
   * Update an existing automation
   * @param uuid Automation UUID
   * @param updateAutomationDto Data for updating the automation
   */
  update(uuid: string, updateAutomationDto: UpdateAutomationDto): Promise<void>;

  /**
   * Delete an automation
   * @param uuid Automation UUID
   */
  delete(uuid: string): Promise<void>;

  /**
   * Execute an automation
   * @param uuid Automation UUID
   */
  execute(uuid: string): Promise<void>;

  /**
   * Set the last execution status of an automation
   * @param uuid Automation UUID
   * @param status Execution status
   */
  setLastExecutionStatus(uuid: string, status: 'success' | 'failed'): Promise<void>;
}