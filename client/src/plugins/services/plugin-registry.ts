import React from 'react';
import { IClientPlugin } from '../interfaces/plugin.interface';
import { HookRegistry } from './hook-registry';
import { RouteRegistry } from './route-registry';
import { SlotRegistry } from './slot-registry';

/**
 * Registry for client plugins
 */
export class PluginRegistry {
  private plugins: Map<string, IClientPlugin> = new Map();
  private routeRegistry: RouteRegistry;
  private slotRegistry: SlotRegistry;
  private hookRegistry: HookRegistry;

  constructor() {
    this.routeRegistry = new RouteRegistry();
    this.slotRegistry = new SlotRegistry();
    this.hookRegistry = new HookRegistry();
  }

  /**
   * Register a plugin
   * @param plugin Plugin instance
   * @param app React application component
   */
  registerPlugin(plugin: IClientPlugin, app: React.Component): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(
        `Plugin already registered: ${plugin.id}. Unregistering and re-registering.`,
      );
      this.unregisterPlugin(plugin.id);
    }

    // Initialize the plugin
    plugin.initialize(app);

    // Register components and routes
    this.registerPluginComponents(plugin);
    this.registerPluginRoutes(plugin);

    // Register slots if implemented
    if (plugin.registerSlots) {
      this.registerPluginSlots(plugin);
    }

    // Register hooks if implemented
    if (plugin.registerHooks) {
      this.registerPluginHooks(plugin);
    }

    // Store the plugin instance
    this.plugins.set(plugin.id, plugin);

    console.log(
      `Registered plugin: ${plugin.name} (${plugin.id}) v${plugin.version}`,
    );
  }

  /**
   * Register plugin components
   * @param plugin Plugin instance
   */
  private registerPluginComponents(plugin: IClientPlugin): void {
    // Components are not stored in a registry, they are just used by routes and slots
    // But we need to call registerComponents to ensure the plugin has initialized them
    plugin.registerComponents();
  }

  /**
   * Register plugin routes
   * @param plugin Plugin instance
   */
  private registerPluginRoutes(plugin: IClientPlugin): void {
    const routes = plugin.registerRoutes();

    for (const route of routes) {
      this.routeRegistry.registerRoute(plugin.id, route);
    }
  }

  /**
   * Register plugin slots
   * @param plugin Plugin instance
   */
  private registerPluginSlots(plugin: IClientPlugin): void {
    if (!plugin.registerSlots) return;

    const slots = plugin.registerSlots();

    for (const [slotName, slotDefinitions] of Object.entries(slots)) {
      this.slotRegistry.registerSlot(
        slotName,
        plugin.id,
        `${slotName}-component`,
        slotDefinitions,
      );
    }
  }

  /**
   * Register plugin hooks
   * @param plugin Plugin instance
   */
  private registerPluginHooks(plugin: IClientPlugin): void {
    if (!plugin.registerHooks) return;

    const hooks = plugin.registerHooks();

    for (const [hookName, callbacks] of Object.entries(hooks)) {
      for (const callback of callbacks) {
        this.hookRegistry.registerHook(plugin.id, hookName, callback);
      }
    }
  }

  /**
   * Unregister a plugin
   * @param pluginId Plugin ID
   */
  unregisterPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId);

    if (!plugin) {
      console.warn(`Plugin not found: ${pluginId}`);
      return;
    }

    // Call cleanup if implemented
    if (plugin.cleanup) {
      try {
        plugin.cleanup();
      } catch (error) {
        console.error(`Error during plugin cleanup: ${pluginId}`, error);
      }
    }

    // Clear all plugin registrations
    this.routeRegistry.clearPluginRoutes(pluginId);
    this.slotRegistry.clearPluginSlots(pluginId);
    this.hookRegistry.clearPluginHooks(pluginId);

    // Remove plugin from registry
    this.plugins.delete(pluginId);

    console.log(`Unregistered plugin: ${pluginId}`);
  }

  /**
   * Get all registered plugins
   * @returns Map of plugin ID to plugin instance
   */
  getPlugins(): Map<string, IClientPlugin> {
    return this.plugins;
  }

  /**
   * Get a plugin by ID
   * @param pluginId Plugin ID
   * @returns Plugin instance or undefined if not found
   */
  getPlugin(pluginId: string): IClientPlugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Get the route registry
   * @returns Route registry
   */
  getRouteRegistry(): RouteRegistry {
    return this.routeRegistry;
  }

  /**
   * Get the slot registry
   * @returns Slot registry
   */
  getSlotRegistry(): SlotRegistry {
    return this.slotRegistry;
  }

  /**
   * Get the hook registry
   * @returns Hook registry
   */
  getHookRegistry(): HookRegistry {
    return this.hookRegistry;
  }

  /**
   * Execute a hook
   * @param hookName Hook name
   * @param args Arguments to pass to the hook
   * @returns Array of hook execution results
   */
  async executeHook(hookName: string, ...args: any[]): Promise<any[]> {
    return this.hookRegistry.executeHook(hookName, ...args);
  }

  /**
   * Get a slot renderer component
   * @param slotName Slot name
   * @returns React component
   */
  getSlotRenderer(slotName: string): React.ComponentType<any> {
    return this.slotRegistry.getSlotRenderer(slotName);
  }

  /**
   * Get all routes
   * @returns Array of route definitions
   */
  getRoutes(): any[] {
    return this.routeRegistry.getRoutes();
  }
}
