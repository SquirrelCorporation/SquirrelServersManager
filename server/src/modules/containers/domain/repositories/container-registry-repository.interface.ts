import { ContainerRegistryEntity } from '../entities/container-registry.entity';

export const CONTAINER_REGISTRY_REPOSITORY = 'CONTAINER_REGISTRY_REPOSITORY';

/**
 * Repository interface for container registries
 */
export interface ContainerRegistryRepositoryInterface {
  /**
   * Find all container registries
   */
  findAll(): Promise<ContainerRegistryEntity[]>;

  /**
   * Find one registry by provider
   * @param provider Registry provider
   */
  findOneByProvider(provider: string): Promise<ContainerRegistryEntity | null>;

  /**
   * Find one registry by name
   * @param name Registry name
   */
  findOneByName(name: string): Promise<ContainerRegistryEntity | null>;

  /**
   * Find multiple registries by filter
   * @param filter Filter criteria
   */
  findMany(filter: any): Promise<ContainerRegistryEntity[]>;

  /**
   * Update a registry
   * @param id Registry ID
   * @param registry Updated registry data
   */
  update(id: string, registry: Partial<ContainerRegistryEntity>): Promise<ContainerRegistryEntity>;

  /**
   * Create a new registry
   * @param registry Registry data
   */
  create(registry: Partial<ContainerRegistryEntity>): Promise<ContainerRegistryEntity>;

  /**
   * Delete a registry
   * @param id Registry ID
   */
  delete(id: string): Promise<boolean>;
}
