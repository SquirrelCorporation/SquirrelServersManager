/**
 * @deprecated OBSOLETE FILE - DO NOT USE IN NEW CODE
 * This file is kept for reference only during migration to clean architecture.
 * Please use the new implementation in application/services/container-registries.service.ts
 */

import { Injectable } from '@nestjs/common';
import { ContainerRegistryRepository } from '../repositories/container-registry.repository';
import { ContainerRegistryDocument } from '../schemas/container-registry.schema';
import PinoLogger from '../../../logger';
import { SSMServicesTypes } from '../../../types/typings';
import { WatcherEngineService } from './watcher-engine.service';

const logger = PinoLogger.child(
  { module: 'ContainerRegistriesService' },
  { msgPrefix: '[CONTAINER_REGISTRY] - ' },
);

@Injectable()
export class ContainerRegistriesService {
  constructor(
    private readonly containerRegistryRepository: ContainerRegistryRepository,
    private readonly watcherEngineService: WatcherEngineService
  ) {}

  /**
   * Add a registry if it doesn't already exist
   * @param registry Registry configuration
   */
  async addIfNotExists(registry: SSMServicesTypes.RegistryAuthConfig) {
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
  async updateRegistryAuth(registry: ContainerRegistryDocument, auth: any) {
    registry.auth = auth;
    registry.authSet = true;
    await this.containerRegistryRepository.updateOne(registry);
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
  async createCustomRegistry(name: string, auth: any, authScheme: any) {
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
  async removeRegistryAuth(registry: ContainerRegistryDocument) {
    registry.auth = undefined;
    registry.authSet = false;
    await this.containerRegistryRepository.updateOne(registry);
    await this.watcherEngineService.deregisterRegistries();
    await this.watcherEngineService.registerRegistries();
  }

  /**
   * List all registries with authentication set up
   * @returns List of registries
   */
  async listAllSetupRegistries() {
    return this.containerRegistryRepository.findMany({ authSet: true });
  }
}