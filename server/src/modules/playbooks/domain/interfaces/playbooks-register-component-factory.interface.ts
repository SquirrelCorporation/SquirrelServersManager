import { GitComponentOptions, LocalComponentOptions } from './component-options.interface';
import { IPlaybooksRegisterComponent } from './playbooks-register-component.interface';

export const PLAYBOOKS_REGISTER_COMPONENT_FACTORY = 'PLAYBOOKS_REGISTER_COMPONENT_FACTORY';

/**
 * Interface for the playbooks register component factory
 */
export interface IPlaybooksRegisterComponentFactory {
  /**
   * Create a Git-based playbooks register component
   * @param options Git component options
   * @returns Git component instance
   */
  createGitComponent(options: GitComponentOptions): Promise<IPlaybooksRegisterComponent>;
  
  /**
   * Create a local playbooks register component
   * @param options Local component options
   * @returns Local component instance
   */
  createLocalComponent(options: LocalComponentOptions): Promise<IPlaybooksRegisterComponent>;
}