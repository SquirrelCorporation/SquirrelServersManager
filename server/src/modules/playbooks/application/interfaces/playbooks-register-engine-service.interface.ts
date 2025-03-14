import { IPlaybooksRegister } from '../../domain/entities/playbooks-register.entity';
import { IPlaybooksRegisterComponent } from '../../domain/interfaces/playbooks-register-component.interface';

export const PLAYBOOKS_REGISTER_ENGINE_SERVICE = 'PLAYBOOKS_REGISTER_ENGINE_SERVICE';

/**
 * Interface for the playbooks register engine service
 */
export interface IPlaybooksRegisterEngineService {
  /**
   * Register a new playbooks repository
   * @param register Playbooks register entity
   */
  registerRegister(register: IPlaybooksRegister): Promise<void>;
  
  /**
   * Remove a playbooks repository
   * @param registerUuid Register UUID to deregister
   */
  deregisterRegister(registerUuid: string): Promise<void>;
  
  /**
   * Get a specific repository by UUID
   * @param registerUuid Register UUID
   * @returns The register component or undefined if not found
   */
  getRepository(registerUuid: string): IPlaybooksRegisterComponent | undefined;
  
  /**
   * Get the current state of all repositories
   * @returns Record of register components by UUID
   */
  getState(): Record<string, IPlaybooksRegisterComponent>;
}