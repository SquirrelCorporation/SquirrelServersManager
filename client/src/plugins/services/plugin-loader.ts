import { getPlugins } from '@/services/rest/plugins';
import { IClientPlugin } from '../interfaces/plugin.interface';

/**
 * Service for loading plugins dynamically
 */
export class PluginLoader {
  private pluginsBasePath: string;

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
      const plugins = await getPlugins();
      console.log(`Found ${plugins.length} plugins:`, plugins);
      return plugins;
    } catch (error) {
      console.error('Error scanning for plugins:', error);
      return [];
    }
  }

  /**
   * Load a plugin by metadata
   * @param pluginMetadata Plugin metadata from the server
   * @returns Promise with plugin instance
   */
  async loadPlugin(pluginMetadata: any): Promise<IClientPlugin | null> {
    try {
      // Construct the path to the plugin using the ID
      const pluginPath = `${this.pluginsBasePath}/client/${pluginMetadata.id}/index.jsx`;

      console.log(`Attempting to load plugin from: ${pluginPath}`);

      // Check if the plugin file exists
      try {
        console.log(`Checking plugin path: ${pluginPath}`);
        const response = await fetch(pluginPath, {
          method: 'HEAD',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        });

        if (!response.ok) {
          console.error(
            `Plugin file not found at: ${pluginPath} (Status: ${response.status})`,
          );
          return this.createMockPlugin(pluginMetadata);
        }
      } catch (error) {
        console.error(`Error checking plugin path: ${pluginPath}`, error);
        return this.createMockPlugin(pluginMetadata);
      }

      // Load the plugin
      console.log(`Loading plugin from: ${pluginPath}`);
      const pluginModule = await import(/* @vite-ignore */ pluginPath);

      // Get the default export (plugin class)
      const PluginClass = pluginModule.default;

      if (!PluginClass) {
        console.error(
          `Plugin ${pluginMetadata.id} does not export a default class`,
        );
        return this.createMockPlugin(pluginMetadata);
      }

      // Create an instance of the plugin
      const plugin = new PluginClass();

      // Set plugin metadata if not already set
      if (!plugin.id) plugin.id = pluginMetadata.id;
      if (!plugin.name) plugin.name = pluginMetadata.name;
      if (!plugin.version) plugin.version = pluginMetadata.version;
      if (!plugin.description)
        plugin.description = pluginMetadata.description || '';
      if (!plugin.author) plugin.author = pluginMetadata.author || '';

      console.log(`Successfully loaded plugin: ${plugin.name} (${plugin.id})`);

      return plugin;
    } catch (error) {
      console.error(`Error loading plugin ${pluginMetadata.id}:`, error);
      return this.createMockPlugin(pluginMetadata);
    }
  }

  /**
   * Create a mock plugin instance
   * @param pluginMetadata Plugin metadata
   * @returns Mock plugin instance
   */
  private createMockPlugin(pluginMetadata: any): IClientPlugin {
    console.log(`Creating mock plugin for: ${pluginMetadata.id}`);

    // Create a mock plugin class
    class MockPlugin implements IClientPlugin {
      id = pluginMetadata.id;
      name = pluginMetadata.name;
      version = pluginMetadata.version;
      description = pluginMetadata.description || '';
      author = pluginMetadata.author || '';

      initialize(app: any): void {
        console.log(`Mock plugin ${this.name} initialized`);
      }

      registerComponents(): Record<string, React.ComponentType<any>> {
        return {};
      }

      registerRoutes(): any[] {
        return [];
      }

      registerSlots?(): Record<string, any> {
        return {};
      }

      registerHooks?(): Record<string, any[]> {
        return {
          onInit: [
            () => {
              console.log(`Mock plugin ${this.name} onInit hook called`);
              return Promise.resolve();
            },
          ],
        };
      }

      cleanup?(): void {
        console.log(`Mock plugin ${this.name} cleanup`);
      }
    }

    const plugin = new MockPlugin();
    console.log(
      `Successfully created mock plugin: ${plugin.name} (${plugin.id})`,
    );

    return plugin;
  }

  /**
   * Load plugins from metadata
   * @param pluginsMetadata Array of plugin metadata from the server
   * @returns Promise with array of plugin instances
   */
  async loadPlugins(pluginsMetadata: any[]): Promise<IClientPlugin[]> {
    const plugins: IClientPlugin[] = [];

    console.log(`Loading ${pluginsMetadata.length} plugins...`);
    console.log('Plugin metadata:', JSON.stringify(pluginsMetadata, null, 2));

    for (const metadata of pluginsMetadata) {
      // Skip disabled plugins
      if (metadata.enabled === false) {
        console.log(`Skipping disabled plugin: ${metadata.id}`);
        continue;
      }

      console.log(
        `Attempting to load plugin: ${metadata.id} (${metadata.name})`,
      );
      const plugin = await this.loadPlugin(metadata);
      if (plugin) {
        plugins.push(plugin);
        console.log(`Successfully loaded plugin: ${plugin.name}`);
      } else {
        console.warn(`Failed to load plugin: ${metadata.id}`);
      }
    }

    console.log(
      `Loaded ${plugins.length} of ${pluginsMetadata.length} plugins`,
    );

    return plugins;
  }
}
