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

  // Added: Function to load a specific component
  loadRemoteComponentFromPlugin: (
    pluginId: string,
    exposedModule: string,
  ) => Promise<React.ComponentType<any>>; // Return type is a React component
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
      const metadataArray = await fetchPluginMetadata();
      console.log(
        'Fetched plugin metadata:',
        JSON.stringify(metadataArray, null, 2),
      );
      setPluginMetadata(metadataArray);

      if (!appComponent) {
        console.error('Cannot register plugins: App component not initialized');
        return;
      }

      const loadedPlugins = await pluginLoader.loadPlugins(metadataArray);

      if (loadedPlugins.length === 0 && metadataArray.length > 0) {
        console.warn(
          'No plugins could be loaded, but metadata was found. Check plugin paths and server configuration.',
        );
      }

      // Register plugins
      console.log(`Registering ${loadedPlugins.length} plugins...`);
      for (const plugin of loadedPlugins) {
        try {
          // Find the corresponding metadata object for this plugin
          const metadata = metadataArray.find((m) => m.id === plugin.id);
          if (!metadata) {
            console.warn(
              `Metadata not found for loaded plugin with id: ${plugin.id}. Skipping registration.`,
            );
            continue; // Skip registration if metadata not found
          }

          // Use the correct 3-argument call now
          console.log(`Registering plugin: ${plugin.id} (using metadata)`);
          pluginRegistry.registerPlugin(plugin, metadata, appComponent!);
          console.log(`Successfully registered plugin: ${plugin.id}`);
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
    if (!plugin.id) {
      console.error(
        'Manual plugin registration failed: Plugin is missing an ID.',
        plugin,
      );
      return;
    }
    if (appComponent) {
      // Find metadata for the manually provided plugin
      const metadata = pluginMetadata.find((m) => m.id === plugin.id);
      if (!metadata) {
        console.error(
          `Cannot manually register plugin ${plugin.id}: Metadata not found. Ensure metadata is loaded first.`,
        );
        return;
      }
      pluginRegistry.registerPlugin(plugin, metadata, appComponent);
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

  // Added: Function to load a remote component using the loader instance
  const loadRemoteComponentFromPlugin = async (
    pluginId: string,
    exposedModule: string,
  ): Promise<React.ComponentType<any>> => {
    const metadata = pluginMetadata.find((m) => m.id === pluginId);
    if (!metadata) {
      throw new Error(`Metadata not found for plugin ID: ${pluginId}`);
    }
    const kebabToCamelCase = (str: string) =>
      str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    const federationName = kebabToCamelCase(pluginId);

    // Use the method from the pluginLoader instance
    return pluginLoader.loadRemoteComponentHelper(
      federationName,
      exposedModule,
    );
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
    loadRemoteComponentFromPlugin,
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
