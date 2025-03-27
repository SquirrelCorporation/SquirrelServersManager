import { Systeminformation } from 'ssm-shared-lib';
import { Callback } from '../types/remote-executor.types';
import { ISystemInformationComponent } from './system-information-component.interface';

/**
 * Interface for CPU component functionality
 */
export interface ICpuComponent extends ISystemInformationComponent {
  /**
   * Get CPU information
   * @param callback Optional callback function
   */
  cpu(callback?: Callback): Promise<Systeminformation.CpuData>;

  /**
   * Get CPU current speed information
   * @param callback Optional callback function
   */
  cpuCurrentSpeed(callback?: Callback): Promise<Systeminformation.CpuCurrentSpeedData>;

  /**
   * Get CPU temperature information
   * @param callback Optional callback function
   */
  cpuTemperature(callback?: Callback): Promise<Systeminformation.CpuTemperatureData>;

  /**
   * Get CPU flags
   * @param callback Optional callback function
   */
  cpuFlags(callback?: Callback): Promise<string>;

  /**
   * Get CPU cache information
   * @param callback Optional callback function
   */
  cpuCache(callback?: Callback): Promise<Systeminformation.CpuCacheData>;

  /**
   * Get CPU current load information
   * @param callback Optional callback function
   */
  currentLoad(callback?: Callback): Promise<Partial<Systeminformation.CurrentLoadData>>;

  /**
   * Get CPU full load since bootup
   * @param callback Optional callback function
   */
  fullLoad(callback?: Callback): Promise<number>;
}
