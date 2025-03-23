import { OnModuleInit } from '@nestjs/common';
import { AutomationComponent } from '../../domain/components/automation.component';
import { Automation } from '../../domain/entities/automation.entity';

export const AUTOMATION_ENGINE_SERVICE = 'AUTOMATION_ENGINE_SERVICE';

/**
 * Interface for the Automation Engine Service
 */
export interface IAutomationEngineService extends OnModuleInit {
  /**
   * Get the current state of all registered automations
   * @returns Map of registered automation components
   */
  getStates(): { automation: Map<string, AutomationComponent> };

  /**
   * Register a single automation component
   * @param automationToRegister The automation to register
   */
  registerComponent(automationToRegister: Automation): Promise<void>;

  /**
   * Deregister an automation component
   * @param automation The automation to deregister
   */
  deregisterComponent(automation: Automation): Promise<void>;

  /**
   * Execute an automation manually
   * @param automation The automation to execute
   */
  executeAutomation(automation: Automation): Promise<void>;

  /**
   * Initialize the automation engine when the module is loaded
   */
  onModuleInit(): Promise<void>;
}
