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
  // Store registered components: Map<pluginName, Record<componentName, ComponentType>>
  private components: Map<string, Record<string, React.ComponentType<any>>> =
    new Map();
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
   * @param manifest Plugin manifest/metadata object from server
   * @param app React application component
   */
  registerPlugin(
    plugin: IClientPlugin,
    manifest: any,
    app: React.Component,
  ): void {
    const pluginId = plugin.id;
    if (!pluginId) {
      console.error(
        'Plugin registration failed: Plugin is missing an ID.',
        plugin,
      );
      return;
    }
    if (this.plugins.has(pluginId)) {
      console.warn(
        `Plugin already registered: ${pluginId}. Unregistering and re-registering.`,
      );
      this.unregisterPlugin(pluginId);
    }

    plugin.initialize(app);
    this.registerPluginComponents(plugin);

    // Register slots if implemented
    if (plugin.registerSlots) {
      this.registerPluginSlots(plugin);
    }

    // Register hooks if implemented
    if (plugin.registerHooks) {
      this.registerPluginHooks(plugin);
    }

    // Store the plugin instance using its ID
    this.plugins.set(pluginId, plugin);

    console.log(`Registered plugin: ${pluginId} v${plugin.version}`);
  }

  /**
   * Register and store plugin components
   * @param plugin Plugin instance
   */
  private registerPluginComponents(plugin: IClientPlugin): void {
    const pluginComponents = plugin.registerComponents();
    if (pluginComponents && Object.keys(pluginComponents).length > 0) {
      // Store components using plugin.id as the key
      this.components.set(plugin.id, pluginComponents);
      console.log(
        `Registered ${Object.keys(pluginComponents).length} components for plugin: ${plugin.id}`,
      );
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

    // Clear stored components for this plugin
    this.components.delete(pluginId);

    // Remove plugin from registry
    this.plugins.delete(pluginId);

    console.log(`Unregistered plugin: ${pluginId}`);
  }

  /**
   * Get all registered plugins
   * @returns Map of plugin name to plugin instance
   */
  getPlugins(): Map<string, IClientPlugin> {
    return this.plugins;
  }

  /**
   * Get a plugin by name
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

  /**
   * Get all registered components, keyed by plugin name.
   * @returns Map<pluginName, Record<componentName, ComponentType>>
   */
  getAllComponents(): Map<string, Record<string, React.ComponentType<any>>> {
    return this.components;
  }
}
