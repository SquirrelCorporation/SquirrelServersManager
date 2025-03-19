import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { IDevice } from '@modules/devices';
import { AbstractRegistryComponent } from '@modules/containers/application/services/components/registry/abstract-registry.component';
import { AbstractWatcherComponent } from '@modules/containers/application/services/components/watcher/abstract-watcher.component';
import { ConfigurationSchema } from '@modules/containers/types';
import { Kind } from '@modules/containers/domain/components/kind.enum';
import Component from '../services/components/core/component';


export const WATCHER_ENGINE_SERVICE = 'WATCHER_ENGINE_SERVICE';

export interface StateType {
  registry: Record<string, AbstractRegistryComponent>;
  watcher: Record<string, AbstractWatcherComponent>;
}

/**
 * Interface for the Watcher Engine Service
 */
export interface IWatcherEngineService extends OnModuleInit, OnModuleDestroy {
  /**
   * Initialize the service when the module is loaded
   */
  onModuleInit(): Promise<void>;

  /**
   * Clean up when the module is destroyed
   */
  onModuleDestroy(): Promise<void>;

  /**
   * Get the current state
   */
  getStates(): StateType;

  /**
   * Return all supported registries
   */
  getRegistries(): AbstractRegistryComponent[];

  /**
   * Register a component
   */
  registerComponent(
    _id: string,
    kind: Kind,
    provider: string,
    name: string,
    configuration: ConfigurationSchema
  ): Promise<Component<ConfigurationSchema>>;

  /**
   * Register watchers from database
   */
  registerWatchers(): Promise<any>;

  /**
   * Register a single watcher
   */
  registerWatcher(device: IDevice): Promise<any>;

  /**
   * Register registries
   */
  registerRegistries(): Promise<void>;

  /**
   * Deregister a component
   */
  deregisterComponent(
    kind: Kind,
    component: Component<ConfigurationSchema>
  ): Promise<any>;

  /**
   * Deregister all components of a kind
   */
  deregisterComponents(
    kind: Kind,
    components: Component<ConfigurationSchema>[]
  ): Promise<any>;

  /**
   * Deregister all registries
   */
  deregisterRegistries(): Promise<any>;

  /**
   * Deregister all watchers
   */
  deregisterWatchers(): Promise<any>;

  /**
   * Deregister all components
   */
  deregisterAll(): Promise<any>;

  /**
   * Initialize the service
   */
  init(): Promise<void>;

  /**
   * Build a component ID
   */
  buildId(kind: Kind, provider: string, name: string): string;

  /**
   * Find a registered docker component
   */
  findRegisteredDockerComponent(watcher: string);
}