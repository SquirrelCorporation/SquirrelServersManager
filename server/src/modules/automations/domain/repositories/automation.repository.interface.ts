import { Automation } from '../entities/automation.entity';

export interface IAutomationRepository {
  findAll(): Promise<Automation[]>;
  findAllEnabled(): Promise<Automation[]>;
  findOne(uuid: string): Promise<Automation | null>;
  findByUuid(uuid: string): Promise<Automation | null>;
  create(automation: Automation): Promise<Automation>;
  update(uuid: string, automation: Partial<Automation>): Promise<Automation | null>;
  delete(uuid: string): Promise<void>;
  setLastExecutionStatus(uuid: string, status: 'success' | 'failed'): Promise<void>;
}