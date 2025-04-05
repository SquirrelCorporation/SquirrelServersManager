import { RegistryAuthConfig } from '@modules/containers/types';
import { IContainerRegistryEntity } from '../../domain/entities/container-registry.entity';

export const CONTAINER_REGISTRIES_SERVICE = 'CONTAINER_REGISTRIES_SERVICE';

/**
 * Service interface for managing container registries
 */
export interface IContainerRegistriesService {
  /**
   * Add a registry if it doesn't already exist
   * @param registry Registry configuration
   */
  addIfNotExists(registry: RegistryAuthConfig): Promise<void>;

  /**
   * Update registry authentication
   * @param registry Registry to update
   * @param auth Authentication details
   */
  updateRegistryAuth(registry: IContainerRegistryEntity, auth: any): Promise<void>;

  /**
   * Create a custom registry
   * @param name Registry name
   * @param auth Authentication details
   * @param authScheme Authentication scheme
   * @returns The created registry
   */
  createCustomRegistry(name: string, auth: any, authScheme: any): Promise<IContainerRegistryEntity>;

  /**
   * Remove registry authentication
   * @param registry Registry to update
   */
  removeRegistryAuth(registry: IContainerRegistryEntity): Promise<void>;

  /**
   * List all registries with authentication set up
   * @returns List of registries
   */
  listAllSetupRegistries(): Promise<IContainerRegistryEntity[]>;

  /**
   * Get all registries
   * @returns List of all registries
   */
  getAllRegistries(): Promise<IContainerRegistryEntity[]>;

  /**
   * Get registry by name
   * @param name Registry name
   * @returns Registry or null if not found
   */
  getRegistryByName(name: string): Promise<IContainerRegistryEntity | null>;

  /**
   * Delete registry
   * @param registry Registry to delete
   * @returns Success flag
   */
  deleteRegistry(registry: IContainerRegistryEntity): Promise<boolean>;
}
