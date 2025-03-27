import { Callback } from '../types/remote-executor.types';

/**
 * Base interface for all system information components
 * Each specific component (CPU, Memory, etc.) will extend this
 * with their specific methods
 */
export interface ISystemInformationComponent {
  /**
   * Initialize the component
   */
  init(): Promise<void>;
  
  /**
   * Platform of the remote system (linux, darwin, win32, etc.)
   */
  readonly platform: string;
  
  /**
   * Get the CPU architecture of the remote system
   */
  arch(): Promise<string>;
  
  /**
   * Get the number of CPU cores on the remote system
   */
  cores(): number;
}