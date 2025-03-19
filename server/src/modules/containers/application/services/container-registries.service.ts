import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { RegistryAuthConfig } from '@modules/containers/types';
import { ContainerRegistryEntity } from '../../domain/entities/container-registry.entity';
import { ContainerRegistriesServiceInterface } from '../interfaces/container-registries-service.interface';
import { CONTAINER_REGISTRY_REPOSITORY, ContainerRegistryRepositoryInterface } from '../../domain/repositories/container-registry-repository.interface';
import { IWatcherEngineService, WATCHER_ENGINE_SERVICE } from '../interfaces/watcher-engine-service.interface';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child(
  { module: 'ContainerRegistriesService' },
  { msgPrefix: '[CONTAINER_REGISTRY] - ' },
);

@Injectable()
export class ContainerRegistriesService implements ContainerRegistriesServiceInterface {
  constructor(
    @Inject(CONTAINER_REGISTRY_REPOSITORY)
    private readonly containerRegistryRepository: ContainerRegistryRepositoryInterface,
    @Inject(forwardRef(() => WATCHER_ENGINE_SERVICE))
    private readonly watcherEngineService: IWatcherEngineService
  ) {}

  /**
   * Get all registries
   * @returns List of all registries
   */
  async getAllRegistries(): Promise<ContainerRegistryEntity[]> {
    return this.containerRegistryRepository.findAll();
  }

  /**
   * Get registry by name
   * @param name Registry name
   * @returns Registry or null if not found
   */
  async getRegistryByName(name: string): Promise<ContainerRegistryEntity | null> {
    return this.containerRegistryRepository.findOneByName(name);
  }

  /**
   * Add a registry if it doesn't already exist
   * @param registry Registry configuration
   */
  async addIfNotExists(registry: RegistryAuthConfig): Promise<void> {
    const containerRegistry = await this.containerRegistryRepository.findOneByProvider(registry.provider);
    if (!containerRegistry) {
      const savedRegistry = await this.containerRegistryRepository.create({
        name: registry.name,
        fullName: registry.fullName,
        provider: registry.provider,
        authScheme: registry.authScheme,
        authSet: false,
        canAnonymous: registry.config.canAnonymous || false,
        canAuth: registry.authScheme !== undefined,
      });
      logger.info(`Saved registry ${savedRegistry.name}`);
    } else {
      logger.info(`Registry ${registry.name} already exists`);
    }
  }

  /**
   * Update registry authentication
   * @param registry Registry to update
   * @param auth Authentication details
   */
  async updateRegistryAuth(registry: ContainerRegistryEntity, auth: any): Promise<void> {
    if (!registry.id) {
      throw new Error('Registry ID is required');
    }

    await this.containerRegistryRepository.update(registry.id, {
      auth: auth,
      authSet: true
    });

    await this.watcherEngineService.deregisterRegistries();
    await this.watcherEngineService.registerRegistries();
  }

  /**
   * Create a custom registry
   * @param name Registry name
   * @param auth Authentication details
   * @param authScheme Authentication scheme
   * @returns The created registry
   */
  async createCustomRegistry(name: string, auth: any, authScheme: any): Promise<ContainerRegistryEntity> {
    logger.info(`Creating registry: ${name}`);

    const newRegistry = await this.containerRegistryRepository.create({
      name: name,
      auth: auth,
      authSet: true,
      provider: 'custom',
      canAnonymous: false,
      canAuth: true,
      authScheme: authScheme,
    });

    await this.watcherEngineService.deregisterRegistries();
    await this.watcherEngineService.registerRegistries();

    return newRegistry;
  }

  /**
   * Remove registry authentication
   * @param registry Registry to update
   */
  async removeRegistryAuth(registry: ContainerRegistryEntity): Promise<void> {
    if (!registry.id) {
      throw new Error('Registry ID is required');
    }

    await this.containerRegistryRepository.update(registry.id, {
      auth: undefined,
      authSet: false
    });

    await this.watcherEngineService.deregisterRegistries();
    await this.watcherEngineService.registerRegistries();
  }

  /**
   * List all registries with authentication set up
   * @returns List of registries
   */
  async listAllSetupRegistries(): Promise<ContainerRegistryEntity[]> {
    return this.containerRegistryRepository.findMany({ authSet: true });
  }

  /**
   * Delete registry
   * @param registry Registry to delete
   * @returns Success flag
   */
  async deleteRegistry(registry: ContainerRegistryEntity): Promise<boolean> {
    if (!registry.id) {
      throw new Error('Registry ID is required');
    }

    await this.containerRegistryRepository.delete(registry.id);
    await this.watcherEngineService.deregisterRegistries();
    await this.watcherEngineService.registerRegistries();

    return true;
  }
}
