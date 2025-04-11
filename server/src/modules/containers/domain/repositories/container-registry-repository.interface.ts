import { IContainerRegistryEntity } from '../entities/container-registry.entity';

export const CONTAINER_REGISTRY_REPOSITORY = 'CONTAINER_REGISTRY_REPOSITORY';

/**
 * Repository interface for container registries
 */
export interface IContainerRegistryRepository {
  /**
   * Find all container registries
   */
  findAll(): Promise<IContainerRegistryEntity[]>;

  /**
   * Find one registry by provider
   * @param provider Registry provider
   */
  findOneByProvider(provider: string): Promise<IContainerRegistryEntity | null>;

  /**
   * Find one registry by name
   * @param name Registry name
   */
  findOneByName(name: string): Promise<IContainerRegistryEntity | null>;

  /**
   * Find multiple registries by filter
   * @param filter Filter criteria
   */
  findMany(filter: any): Promise<IContainerRegistryEntity[]>;

  /**
   * Update a registry
   * @param id Registry ID
   * @param registry Updated registry data
   */
  update(
    id: string,
    registry: Partial<IContainerRegistryEntity>,
  ): Promise<IContainerRegistryEntity>;

  /**
   * Create a new registry
   * @param registry Registry data
   */
  create(registry: Partial<IContainerRegistryEntity>): Promise<IContainerRegistryEntity>;

  /**
   * Delete a registry
   * @param id Registry ID
   */
  delete(id: string): Promise<boolean>;
}
