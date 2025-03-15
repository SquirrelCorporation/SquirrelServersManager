import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Component, { Kind } from '../../core/Component';
import { SSMServicesTypes } from '../../../../types/typings';
import Docker from '../../watchers/providers/docker/Docker';
import Registry from '../../registries/Registry';
import Device from '../../../../data/database/model/Device';

export const WATCHER_ENGINE_SERVICE = 'WATCHER_ENGINE_SERVICE';

export interface StateType {
  registry: Record<string, Registry>;
  watcher: Record<string, Docker>;
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
  getRegistries(): Registry[];

  /**
   * Register a component
   */
  registerComponent(
    _id: string,
    kind: Kind,
    provider: string,
    name: string,
    configuration: SSMServicesTypes.ConfigurationSchema
  ): Promise<Component<SSMServicesTypes.ConfigurationSchema>>;

  /**
   * Register watchers from database
   */
  registerWatchers(): Promise<any>;

  /**
   * Register a single watcher
   */
  registerWatcher(device: Device): Promise<any>;

  /**
   * Register registries
   */
  registerRegistries(): Promise<void>;

  /**
   * Deregister a component
   */
  deregisterComponent(
    kind: Kind,
    component: Component<SSMServicesTypes.ConfigurationSchema>
  ): Promise<any>;

  /**
   * Deregister all components of a kind
   */
  deregisterComponents(
    kind: Kind,
    components: Component<SSMServicesTypes.ConfigurationSchema>[]
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
  findRegisteredDockerComponent(watcher: string): Docker | undefined;
}