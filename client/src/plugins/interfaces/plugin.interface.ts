import React from 'react';
import { RouteDefinition } from '../services/route-registry';
import { SlotDefinition } from '../services/slot-registry';

/**
 * Interface for a client plugin hook callback
 */
export type HookCallback = (...args: any[]) => Promise<any> | any;

/**
 * Interface for plugin metadata
 */
export interface PluginMetadata {
  name: string;
  version: string;
  description?: string;
  author?: string;
  dependencies?: Record<string, string>;
  permissions?: string[];
}

/**
 * Store definition for registering custom state
 */
export interface StoreDefinition {
  namespace: string;
  initialState: Record<string, any>;
  reducers: Record<string, (state: any, action: any) => any>;
  effects?: Record<string, (action: any, effects: any) => Promise<any>>;
}

/**
 * Interface for a client plugin
 */
export interface IClientPlugin extends PluginMetadata {
  /**
   * Metadata from the server
   */
  serverMetadata?: any;

  /**
   * Initialize the plugin
   * @param app React application component
   */
  initialize: (app: React.Component) => void;

  /**
   * Register plugin components
   * @returns Record of component names to React components
   */
  registerComponents: () => Record<string, React.ComponentType<any>>;

  /**
   * Register plugin routes
   * @returns Array of route definitions
   */
  registerRoutes: () => RouteDefinition[];

  /**
   * Register plugin UI slots
   * @returns Record of slot names to slot definitions
   */
  registerSlots?: () => Record<string, SlotDefinition>;

  /**
   * Register plugin hooks
   * @returns Record of hook names to hook callbacks
   */
  registerHooks?: () => Record<string, HookCallback[]>;

  /**
   * Register plugin stores
   * @returns Record of store names to store definitions
   */
  registerStores?: () => Record<string, StoreDefinition>;

  /**
   * Cleanup plugin resources
   */
  cleanup?: () => void;
}
