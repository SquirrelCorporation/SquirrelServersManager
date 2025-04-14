import { getPlugins } from '@/services/rest/plugins';
import React from 'react'; // Needed for React.ComponentType
import { IClientPlugin } from '../interfaces/plugin.interface';

// Declare webpack-injected global variables
declare global {
  // eslint-disable-next-line no-var
  var __webpack_init_sharing__: (scope: string) => Promise<void>;
  // eslint-disable-next-line no-var
  var __webpack_share_scopes__: any;
}

// Helper function inside plugin-loader.ts
function kebabToCamelCase(str: string): string {
  return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
}

// Helper function to dynamically load a remoteEntry.js script (if not already present)
function loadScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check if script already exists
    if (document.querySelector(`script[src="${url}"]`)) {
      console.log(`Dynamic script already loaded or loading: ${url}`);
      resolve(); // Assume it's loaded or will load
      return;
    }

    const element = document.createElement('script');
    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      console.log(`Dynamic script loaded: ${url}`);
      // Important: Resolve after the script has presumably executed and registered the remote
      // Sometimes a small timeout helps ensure registration is complete
      setTimeout(() => resolve(), 50);
    };

    element.onerror = (err) => {
      console.error(`Dynamic script load error: ${url}`, err);
      reject(new Error(`Failed to load script: ${url}`));
    };

    document.head.appendChild(element);
  });
}

// Helper function to load a remote module's component using dynamic import (if not already present)
// This leverages how webpack/module federation handles dynamic imports of remotes
async function loadRemoteComponent(
  remoteName: string,
  exposedModule: string,
): Promise<React.ComponentType<any>> {
  console.log(
    `Attempting to load remote component: ${remoteName} -> ${exposedModule}`,
  );
  try {
    // Ensure webpack sharing is initialized
    if (typeof __webpack_init_sharing__ === 'function') {
      await __webpack_init_sharing__('default');
    }

    // @ts-ignore - Accessing global window property is still needed
    const container = window[remoteName]; // Get the remote container
    if (!container) {
      throw new Error(
        `Remote container not found: ${remoteName}. Was remoteEntry.js loaded successfully?`,
      );
    }

    // Initialize the container only if it has an init function and hasn't been initialized
    // @ts-ignore
    if (typeof container.init === 'function' && !container.initialized) {
      if (
        typeof __webpack_share_scopes__ !== 'undefined' &&
        __webpack_share_scopes__.default
      ) {
        await container.init(__webpack_share_scopes__.default); // Initialize the container with the default share scope
        // @ts-ignore
        container.initialized = true; // Mark as initialized
        console.log(`Initialized remote container: ${remoteName}`);
      } else {
        console.warn(
          `Webpack share scopes not available for initializing container ${remoteName}. Skipping init.`,
        );
      }
    }

    // @ts-ignore
    const factory = await container.get(exposedModule); // Get the module factory
    if (!factory) {
      throw new Error(
        `Module ${exposedModule} not found in remote container ${remoteName}. Check exposes configuration.`,
      );
    }
    const Module = factory(); // Execute the factory to get the module
    if (!Module || !Module.default) {
      // Maybe the component itself is the default export? Check Module directly if Module.default fails.
      if (!Module || !React.isValidElement(React.createElement(Module))) {
        // Basic check if Module looks like a component
        throw new Error(
          `Module ${exposedModule} loaded, but does not have a valid React component as default export.`,
        );
      }
      console.log(
        `Successfully loaded remote component: ${remoteName} -> ${exposedModule} (using direct module export)`,
      );
      return Module; // Return the module itself if default export doesn't exist but module is valid component
    }
    console.log(
      `Successfully loaded remote component: ${remoteName} -> ${exposedModule} (using default export)`,
    );
    return Module.default; // Return the default export
  } catch (error) {
    console.error(
      `Error loading remote component ${remoteName}/${exposedModule}:`,
      error,
    );
    throw error; // Re-throw error to be caught by caller
  }
}

/**
 * Service for loading plugins dynamically
 */
export class PluginLoader {
  private pluginsBasePath: string;
  // Map to track loaded remote entry scripts
  private loadedRemoteEntries: Set<string> = new Set();

  /**
   * Constructor
   * @param pluginsBasePath Base path for plugins
   */
  constructor(pluginsBasePath: string = '/static-plugins') {
    this.pluginsBasePath = pluginsBasePath;
    console.log(`PluginLoader initialized with base path: ${pluginsBasePath}`);
  }

  /**
   * Scan for available plugins
   * @returns Promise with array of plugin metadata
   */
  async scanPlugins(): Promise<any[]> {
    try {
      console.log('Scanning for plugins...');
      const { data: plugins } = await getPlugins(); // Adjusted based on provided context
      console.log(`Found ${plugins?.length || 0} plugins:`, plugins);
      return plugins || [];
    } catch (error) {
      console.error('Error scanning for plugins:', error);
      return [];
    }
  }

  /**
   * Load a plugin by metadata using Module Federation
   * @param pluginMetadata Plugin metadata from the server (including client info)
   * @returns Promise with plugin instance or null if loading fails
   */
  async loadClientPlugin(pluginMetadata: any): Promise<IClientPlugin | null> {
    // Check if client-side module information exists in the new format
    if (
      !pluginMetadata.client ||
      !pluginMetadata.id || // Need id to derive federationName
      !pluginMetadata.client.exposedModule ||
      !pluginMetadata.client.remoteEntryRelativePath // Use this for URL consistency check?
      // componentName is used by host, not loader directly
    ) {
      console.warn(
        `Plugin ${pluginMetadata.id || pluginMetadata.name} is missing required 'client' configuration (id, client.exposedModule, client.remoteEntryRelativePath). Skipping client-side loading.`,
      );
      // Return a basic plugin object without a UI component
      // This needs to conform to IClientPlugin
      return {
        // From PluginMetadata (inherited)
        name: pluginMetadata.name || pluginMetadata.id, // Use name or id
        id: pluginMetadata.id, // Ensure id is part of the interface
        version: pluginMetadata.version || '0.0.0',
        description: pluginMetadata.description || '',
        author: pluginMetadata.author || '',
        // IClientPlugin specific required properties
        serverMetadata: pluginMetadata,
        initialize: () => {
          console.log(
            `Plugin ${pluginMetadata.name || pluginMetadata.id} (backend only) initialized`,
          );
        },
        registerComponents: () => ({}),
        registerRoutes: () => [],
        // Optional methods
        registerSlots: () => ({}),
        registerHooks: () => ({}),
        registerStores: () => ({}),
        cleanup: () => {},
      };
    }

    const pluginId = pluginMetadata.id; // kebab-case
    const { exposedModule, remoteEntryRelativePath } = pluginMetadata.client;
    const federationName = kebabToCamelCase(pluginId); // camelCase, derived

    // Construct the expected URL for remoteEntry.js using the relative path from manifest
    const remoteEntryUrl = `/static-plugins/client/${pluginId}/remoteEntry.js`;

    try {
      // Load the remoteEntry.js script only if it hasn't been loaded yet
      if (!this.loadedRemoteEntries.has(remoteEntryUrl)) {
        console.log(
          `Dynamically loading remote entry for ${pluginId} (${federationName}): ${remoteEntryUrl}`,
        );
        await loadScript(remoteEntryUrl);
        this.loadedRemoteEntries.add(remoteEntryUrl);
        console.log(
          `Remote entry loaded and registered (presumably): ${federationName}`,
        );
      } else {
        console.log(
          `Remote entry already loaded for ${pluginId} (${federationName})`,
        );
      }

      // Now attempt to load the component from the (now registered) remote container
      console.log(
        `Loading client component for plugin ${pluginId} via MF: ${federationName} -> ${exposedModule}`,
      );
      const Component = await loadRemoteComponent(
        federationName,
        exposedModule,
      );

      // Create a simple plugin instance that primarily holds the component
      const plugin: IClientPlugin = {
        name: pluginMetadata.name || pluginId,
        id: pluginId,
        version: pluginMetadata.version,
        description: pluginMetadata.description || '',
        author: pluginMetadata.author || '',
        serverMetadata: pluginMetadata,
        initialize: (app: any) => {
          console.log(`Client plugin ${pluginId} initialized.`);
        },
        registerComponents: (): Record<string, React.ComponentType<any>> => {
          const componentKey =
            pluginMetadata.client?.componentName || 'MainComponent';
          return {
            [componentKey]: Component,
          };
        },
        registerRoutes: (): any[] => {
          return [];
        },
        registerSlots: () => ({}),
        registerHooks: () => ({}),
        registerStores: () => ({}),
        cleanup: () => {},
      };

      console.log(
        `Successfully created client plugin instance for: ${pluginId}`,
      );
      return plugin;
    } catch (error) {
      console.error(
        `Failed to load client plugin ${pluginId} (${federationName}/${exposedModule}):`,
        error,
      );
      return null; // Indicate failure
    }
  }

  /**
   * Create a mock plugin instance (used if loading fails)
   * @param pluginMetadata Plugin metadata
   * @returns Mock plugin instance
   */
  private createMockPlugin(pluginMetadata: any): IClientPlugin {
    console.warn(
      `Creating mock plugin for: ${pluginMetadata.id || pluginMetadata.name} due to loading failure.`,
    );
    return {
      name: `${pluginMetadata.name || pluginMetadata.id} (Load Failed)`,
      id: pluginMetadata.id, // Added ID here too
      version: pluginMetadata.version || '0.0.0',
      description: pluginMetadata.description || '',
      author: pluginMetadata.author || '',
      serverMetadata: pluginMetadata,
      initialize: () => {
        console.log(
          `Mock plugin ${pluginMetadata.id || pluginMetadata.name} initialized`,
        );
      },
      registerComponents: () => ({}),
      registerRoutes: () => [],
      registerSlots: () => ({}),
      registerHooks: () => ({}),
      registerStores: () => ({}),
      cleanup: () => {},
    };
  }

  /**
   * Load plugins from metadata
   * @param pluginsMetadata Array of plugin metadata from the server
   * @returns Promise with array of plugin instances
   */
  async loadPlugins(pluginsMetadata: any[]): Promise<IClientPlugin[]> {
    const plugins: IClientPlugin[] = [];

    console.log(
      `Loading ${pluginsMetadata.length} plugins (client-side focus)...`,
    );

    for (const metadata of pluginsMetadata) {
      console.log(
        `Attempting to load client plugin: ${metadata.id || metadata.name}`,
      );
      const plugin = await this.loadClientPlugin(metadata);

      if (plugin) {
        plugins.push(plugin);
        console.log(`Successfully processed plugin: ${plugin.id}`);
      } else {
        console.warn(
          `Failed to load client plugin: ${metadata.id || metadata.name}. Creating mock.`,
        );
        plugins.push(this.createMockPlugin(metadata));
      }
    }

    console.log(`Processed ${plugins.length} plugins client-side.`);
    return plugins;
  }

  // Public method to expose loading remote components
  public async loadRemoteComponentHelper(
    remoteName: string,
    exposedModule: string,
  ): Promise<React.ComponentType<any>> {
    // Directly call the helper function defined in this file
    return loadRemoteComponent(remoteName, exposedModule);
  }
}
