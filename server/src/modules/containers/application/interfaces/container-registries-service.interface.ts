import { ContainerRegistryEntity } from '../../domain/entities/container-registry.entity';
import { SSMServicesTypes } from '../../../../types/typings';

export const CONTAINER_REGISTRIES_SERVICE = 'CONTAINER_REGISTRIES_SERVICE';

/**
 * Service interface for managing container registries
 */
export interface ContainerRegistriesServiceInterface {
  /**
   * Add a registry if it doesn't already exist
   * @param registry Registry configuration
   */
  addIfNotExists(registry: SSMServicesTypes.RegistryAuthConfig): Promise<void>;

  /**
   * Update registry authentication
   * @param registry Registry to update
   * @param auth Authentication details
   */
  updateRegistryAuth(registry: ContainerRegistryEntity, auth: any): Promise<void>;

  /**
   * Create a custom registry
   * @param name Registry name
   * @param auth Authentication details
   * @param authScheme Authentication scheme
   * @returns The created registry
   */
  createCustomRegistry(name: string, auth: any, authScheme: any): Promise<ContainerRegistryEntity>;

  /**
   * Remove registry authentication
   * @param registry Registry to update
   */
  removeRegistryAuth(registry: ContainerRegistryEntity): Promise<void>;

  /**
   * List all registries with authentication set up
   * @returns List of registries
   */
  listAllSetupRegistries(): Promise<ContainerRegistryEntity[]>;

  /**
   * Get all registries
   * @returns List of all registries
   */
  getAllRegistries(): Promise<ContainerRegistryEntity[]>;

  /**
   * Get registry by name
   * @param name Registry name
   * @returns Registry or null if not found
   */
  getRegistryByName(name: string): Promise<ContainerRegistryEntity | null>;

  /**
   * Delete registry
   * @param registry Registry to delete
   * @returns Success flag
   */
  deleteRegistry(registry: ContainerRegistryEntity): Promise<boolean>;
}
