import { getPlugins } from '@/services/rest/plugins';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { IClientPlugin } from '../interfaces/plugin.interface';
import { PluginLoader } from '../services/plugin-loader';
import { PluginRegistry } from '../services/plugin-registry';

interface PluginContextType {
  // The plugin registry
  pluginRegistry: PluginRegistry;

  // Plugin metadata from the server
  pluginMetadata: any[];

  // Loading state
  loading: boolean;

  // Error state
  error: Error | null;

  // Refresh plugins from server
  refreshPlugins: () => Promise<void>;

  // Register a plugin manually
  registerPlugin: (plugin: IClientPlugin) => void;

  // Unregister a plugin
  unregisterPlugin: (pluginId: string) => void;

  // Execute a hook
  executeHook: (hookName: string, ...args: any[]) => Promise<any[]>;

  // Get a slot renderer
  getSlotRenderer: (slotName: string) => React.ComponentType<any>;

  // Get plugin routes
  getPluginRoutes: () => any[];
}

// Create the context
const PluginContext = createContext<PluginContextType | undefined>(undefined);

// Plugin registry instance
const pluginRegistry = new PluginRegistry();

// Plugin loader instance
const pluginLoader = new PluginLoader();

/**
 * Plugin context provider component
 */
export const PluginProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [appComponent, setAppComponent] = useState<React.Component | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pluginMetadata, setPluginMetadata] = useState<any[]>([]);

  // Set the app component ref
  const appRef = (component: React.Component | null) => {
    if (component && !appComponent) {
      setAppComponent(component);
    }
  };

  // Fetch plugin metadata from the server
  const fetchPluginMetadata = async (): Promise<any[]> => {
    try {
      const response = await getPlugins();
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch plugin metadata:', error);
      // Return empty array on error to prevent breaking the app
      return [];
    }
  };

  // Load and register plugins
  const loadPlugins = async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Fetch plugin metadata from the server
      const metadata = await fetchPluginMetadata();
      console.log(
        'Fetched plugin metadata:',
        JSON.stringify(metadata, null, 2),
      );
      setPluginMetadata(metadata);

      if (!appComponent) {
        console.error('Cannot register plugins: App component not initialized');
        return;
      }

      // Load plugins using the metadata from the server
      console.log(`Loading ${metadata.length} plugins...`);
      const plugins = await pluginLoader.loadPlugins(metadata);

      if (plugins.length === 0 && metadata.length > 0) {
        console.warn(
          'No plugins could be loaded, but metadata was found. Check plugin paths and server configuration.',
        );
      }

      // Register plugins
      console.log(`Registering ${plugins.length} plugins...`);
      for (const plugin of plugins) {
        try {
          console.log(`Registering plugin: ${plugin.name} (${plugin.id})`);
          pluginRegistry.registerPlugin(plugin, appComponent);
          console.log(
            `Successfully loaded plugin: ${plugin.name} (${plugin.id})`,
          );
        } catch (error) {
          console.error(`Failed to register plugin: ${plugin.id}`, error);
        }
      }

      // Register plugin routes with history
      const routes = pluginRegistry.getRoutes();
      console.log('Plugin routes:', routes);

      // Execute onInit hook for all plugins
      try {
        console.log('Executing onInit hook for all plugins...');
        await executeHook('onInit');
        console.log('onInit hook executed successfully');
      } catch (error) {
        console.error('Error executing onInit hook:', error);
      }
    } catch (error) {
      console.error('Failed to load plugins:', error);
      setError(
        error instanceof Error
          ? error
          : new Error('Unknown error loading plugins'),
      );
    } finally {
      setLoading(false);
    }
  };

  // Refresh plugins (reload from server)
  const refreshPlugins = async (): Promise<void> => {
    await loadPlugins();
  };

  // Register a plugin manually
  const registerPlugin = (plugin: IClientPlugin): void => {
    if (appComponent) {
      pluginRegistry.registerPlugin(plugin, appComponent);
    } else {
      console.error('Cannot register plugin: App component not initialized');
    }
  };

  // Unregister a plugin
  const unregisterPlugin = (pluginId: string): void => {
    pluginRegistry.unregisterPlugin(pluginId);
  };

  // Execute a hook
  const executeHook = async (
    hookName: string,
    ...args: any[]
  ): Promise<any[]> => {
    return pluginRegistry.executeHook(hookName, ...args);
  };

  // Get a slot renderer
  const getSlotRenderer = (slotName: string): React.ComponentType<any> => {
    return pluginRegistry.getSlotRenderer(slotName);
  };

  // Get plugin routes
  const getPluginRoutes = (): any[] => {
    return pluginRegistry.getRoutes();
  };

  // Load plugins when component mounts and app component is set
  useEffect(() => {
    if (appComponent) {
      loadPlugins();
    }
  }, [appComponent]);

  // Context value
  const contextValue: PluginContextType = {
    pluginRegistry,
    pluginMetadata,
    loading,
    error,
    refreshPlugins,
    registerPlugin,
    unregisterPlugin,
    executeHook,
    getSlotRenderer,
    getPluginRoutes,
  };

  return (
    <PluginContext.Provider value={contextValue}>
      <div ref={appRef as any}>{children}</div>
    </PluginContext.Provider>
  );
};

/**
 * Hook to use the plugin context
 */
export const usePlugins = (): PluginContextType => {
  const context = useContext(PluginContext);

  if (!context) {
    throw new Error('usePlugins must be used within a PluginProvider');
  }

  return context;
};

/**
 * Hook to render a slot
 */
export const useSlot = (slotName: string): React.ComponentType<any> => {
  const { getSlotRenderer } = usePlugins();
  return getSlotRenderer(slotName);
};
