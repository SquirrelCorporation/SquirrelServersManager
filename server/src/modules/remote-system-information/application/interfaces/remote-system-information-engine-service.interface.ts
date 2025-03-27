import { IDevice } from '../../../../modules/devices/domain/entities/device.entity';
import { IComponent } from '../../domain/interfaces/component.interface';
import { RemoteSystemInformationConfigurationSchema } from '../../domain/types/configuration.types';

/**
 * Interface for the Remote System Information Engine service
 */
export interface IRemoteSystemInformationEngineService {
  /**
   * Initialize the engine
   */
  init(): Promise<void>;

  /**
   * Register a component
   * @param _id Component ID
   * @param provider Provider name
   * @param name Component name
   * @param configuration Component configuration
   */
  registerComponent(
    _id: string,
    provider: string,
    name: string,
    configuration: RemoteSystemInformationConfigurationSchema,
  ): Promise<any>;

  /**
   * Register a watcher for a specific device
   * @param device The device to register a watcher for
   */
  registerWatcher(device: IDevice): Promise<any>;

  /**
   * Register all watchers based on devices in the database
   */
  registerWatchers(): Promise<any>;

  /**
   * Deregister a component
   * @param component The component to deregister
   */
  deregisterComponent(component: IComponent): Promise<any>;

  /**
   * Deregister all components
   */
  deregisterAll(): Promise<any>;
}
