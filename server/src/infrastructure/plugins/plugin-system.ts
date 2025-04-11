import * as fs from 'fs';
import * as path from 'path';
import { DynamicModule, INestApplication } from '@nestjs/common';
import express from 'express';
import mongoose from 'mongoose';
import logger from '../../logger';

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  entryPoint: string;
  staticDir?: string; // Optional path to static files directory
  database?: string; // Optional database name for the plugin
}

export interface RouteDefinition {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
  handler: (req: any, res: any) => void;
  description?: string;
}

export interface PluginLogger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

export interface PluginContext {
  dbConnection?: mongoose.Connection; // Database connection if requested
  logger: PluginLogger; // Logger for the plugin
}

export interface Plugin {
  register(app: INestApplication, context: PluginContext): Promise<void>;
  registerRoutes?(): RouteDefinition[] | Promise<RouteDefinition[]>;
}

export class PluginSystem {
  private static instance: PluginSystem;
  private pluginsDir: string;
  private plugins: Map<string, Plugin> = new Map();
  private manifests: Map<string, PluginManifest> = new Map();
  private dbConnections: Map<string, mongoose.Connection> = new Map();
  private pluginLoggers: Map<string, PluginLogger> = new Map();

  private constructor(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
  }

  public static getInstance(pluginsDir?: string): PluginSystem {
    if (!PluginSystem.instance) {
      const basePath = '/data/plugins';
      // Following the project structure - plugins at project root
      const resolvedPluginsDir = pluginsDir || path.join(basePath, 'plugins');
      PluginSystem.instance = new PluginSystem(resolvedPluginsDir);
    }
    return PluginSystem.instance;
  }

  private createPluginLogger(pluginName: string): PluginLogger {
    return {
      info: (message: string, ...args: any[]) => {
        logger.info(`[Plugin:${pluginName}] ${message}`, ...args);
      },
      warn: (message: string, ...args: any[]) => {
        logger.warn(`[Plugin:${pluginName}] ${message}`, ...args);
      },
      error: (message: string, ...args: any[]) => {
        logger.error(`[Plugin:${pluginName}] ${message}`, ...args);
      },
      debug: (message: string, ...args: any[]) => {
        logger.debug(`[Plugin:${pluginName}] ${message}`, ...args);
      },
    };
  }

  public async scanAndLoadPlugins(): Promise<void> {
    try {
      logger.info(`Scanning for plugins in directory: ${this.pluginsDir}`);

      if (!fs.existsSync(this.pluginsDir)) {
        logger.warn(`Plugins directory not found: ${this.pluginsDir}`);
        return;
      }

      const pluginFolders = fs
        .readdirSync(this.pluginsDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      logger.info(`Found ${pluginFolders.length} potential plugins: ${pluginFolders.join(', ')}`);

      for (const folder of pluginFolders) {
        const pluginPath = path.join(this.pluginsDir, folder);
        const manifestPath = path.join(pluginPath, 'manifest.json');

        if (!fs.existsSync(manifestPath)) {
          logger.warn(`No manifest.json found in plugin: ${folder}`);
          continue;
        }

        try {
          const manifestContent = fs.readFileSync(manifestPath, 'utf8');
          const manifest = JSON.parse(manifestContent) as PluginManifest;
          const entryPointPath = path.join(pluginPath, manifest.entryPoint);

          logger.info(`Found manifest for ${manifest.name} v${manifest.version}`);

          if (!fs.existsSync(entryPointPath)) {
            logger.warn(`Entry point ${entryPointPath} not found for plugin: ${folder}`);
            continue;
          }

          // Create a logger for this plugin
          const pluginLogger = this.createPluginLogger(manifest.name);
          this.pluginLoggers.set(manifest.name, pluginLogger);

          // Dynamic import of the plugin
          try {
            const pluginModule = await import(entryPointPath);

            // First check for an object with a register method in common export locations
            let pluginObj = null;

            // Check the Plugin export (our new approach)
            if (
              pluginModule.Plugin &&
              typeof pluginModule.Plugin === 'object' &&
              typeof pluginModule.Plugin.register === 'function'
            ) {
              pluginObj = pluginModule.Plugin;
            } else if (
              pluginModule.default &&
              typeof pluginModule.default === 'object' &&
              typeof pluginModule.default.register === 'function'
            ) {
              pluginObj = pluginModule.default;
            } else if (
              pluginModule.module &&
              pluginModule.module.exports &&
              typeof pluginModule.module.exports === 'object' &&
              typeof pluginModule.module.exports.register === 'function'
            ) {
              pluginObj = pluginModule.module.exports;
            }

            // If we found a usable plugin object
            if (pluginObj) {
              this.plugins.set(manifest.name, pluginObj);
              this.manifests.set(manifest.name, manifest);
              logger.info(`Plugin loaded: ${manifest.name} v${manifest.version}`);
              continue;
            }

            // If no direct object, try the constructor approach
            const PluginClass = pluginModule.default || pluginModule.Plugin;

            if (PluginClass && typeof PluginClass === 'function') {
              try {
                const plugin = new PluginClass() as Plugin;
                this.plugins.set(manifest.name, plugin);
                this.manifests.set(manifest.name, manifest);
                logger.info(`Plugin loaded: ${manifest.name} v${manifest.version}`);
                continue;
              } catch (err: any) {
                logger.error(`Error instantiating plugin class: ${err.message}`);
                throw err;
              }
            }

            // If we got here, we couldn't find a usable plugin implementation
            logger.error(`No usable plugin implementation found in ${folder}`);
          } catch (importError: any) {
            logger.error(`Error importing plugin module: ${folder}`, importError);
            throw importError;
          }
        } catch (error: any) {
          logger.error(`Failed to load plugin: ${folder}`, error);
        }
      }
    } catch (error: any) {
      logger.error('Error scanning plugins directory:', error);
    }
  }

  private async setupDatabaseConnections(): Promise<void> {
    for (const [pluginName, manifest] of this.manifests.entries()) {
      if (manifest.database) {
        try {
          const pluginLogger = this.pluginLoggers.get(pluginName);
          pluginLogger?.info(`Setting up database connection for plugin`);

          const dbName = manifest.database;
          // Use the existing mongoose connection and create a new connection with the same options
          // but for the plugin's database
          const connection = mongoose.connection.useDb(dbName, {
            useCache: true, // Use connection caching for better performance
          });

          this.dbConnections.set(pluginName, connection);
          pluginLogger?.info(`Database connection established using existing NestJS connection`);
        } catch (error: any) {
          const pluginLogger = this.pluginLoggers.get(pluginName);
          pluginLogger?.error(`Failed to set up database connection: ${error.message}`);
        }
      }
    }
  }

  public async initializePlugins(app: INestApplication): Promise<void> {
    logger.info(`Initializing ${this.plugins.size} plugins...`);

    if (this.plugins.size === 0) {
      logger.warn('No plugins to initialize');
      return;
    }

    logger.info(`Plugins to initialize: ${Array.from(this.plugins.keys()).join(', ')}`);

    // Set up database connections for plugins
    await this.setupDatabaseConnections();

    // First initialize each plugin
    for (const [name, plugin] of this.plugins.entries()) {
      try {
        if (!plugin || typeof plugin.register !== 'function') {
          logger.error(`Invalid plugin object for ${name}`);
          continue;
        }

        const pluginLogger = this.pluginLoggers.get(name);
        if (pluginLogger) {
          pluginLogger.info(`Initializing plugin`);
        } else {
          logger.error(`No logger found for plugin: ${name}`);
        }

        const context: PluginContext = {
          dbConnection: this.dbConnections.get(name),
          logger: pluginLogger || this.createPluginLogger(name),
        };

        await plugin.register(app, context);

        if (pluginLogger) {
          pluginLogger.info(`Plugin initialized successfully`);
        }
      } catch (error: any) {
        const pluginLogger = this.pluginLoggers.get(name);
        if (pluginLogger) {
          pluginLogger.error(`Failed to initialize plugin: ${error.message}`);
        } else {
          logger.error(`Failed to initialize plugin ${name}: ${error.message}`);
        }
      }
    }

    // Set up static file serving for plugins
    this.setupStaticFileServing(app);

    // Collect all routes from plugins
    const pluginRoutesByName = new Map<string, RouteDefinition[]>();
    for (const [name, plugin] of this.plugins.entries()) {
      try {
        const pluginLogger = this.pluginLoggers.get(name);

        if (plugin && typeof plugin.registerRoutes === 'function') {
          pluginLogger?.info(`Collecting routes from plugin`);

          try {
            const routes = await Promise.resolve(plugin.registerRoutes());
            if (Array.isArray(routes) && routes.length > 0) {
              pluginLogger?.info(`Plugin provided ${routes.length} routes`);
              pluginRoutesByName.set(name, routes);
            }
          } catch (routesError: any) {
            pluginLogger?.error(`Error getting routes: ${routesError.message}`);
          }
        }
      } catch (error: any) {
        const pluginLogger = this.pluginLoggers.get(name);
        pluginLogger?.error(`Failed to get routes: ${error.message}`);
      }
    }

    // Register all collected routes
    for (const [pluginName, routes] of pluginRoutesByName.entries()) {
      const pluginLogger = this.pluginLoggers.get(pluginName);
      pluginLogger?.info(`Registering ${routes.length} routes`);

      try {
        // Get the Express instance to register routes
        const httpAdapter = app.getHttpAdapter();
        if (httpAdapter && typeof httpAdapter.getInstance === 'function') {
          const expressInstance = httpAdapter.getInstance();

          if (expressInstance) {
            // Define the plugin base path
            const basePath = `/plugins/${pluginName.toLowerCase()}`;
            pluginLogger?.info(`Using base path: ${basePath}`);

            // Create a router for this plugin
            const router = express.Router();
            router.use(express.json());
            router.use(express.urlencoded({ extended: true }));

            // Register each route on the router
            routes.forEach((route) => {
              try {
                // Form the relative path (without the base)
                const relativePath = route.path.startsWith('/') ? route.path : `/${route.path}`;

                // Register the route with the router
                if (typeof router[route.method] === 'function') {
                  router[route.method](relativePath, (req, res, next) => {
                    try {
                      route.handler(req, res);
                    } catch (error: any) {
                      pluginLogger?.error(`Error in route handler: ${error.message}`);
                      next(error);
                    }
                  });
                  pluginLogger?.info(
                    `Registered route: ${route.method.toUpperCase()} ${basePath}${relativePath}`,
                  );
                } else {
                  pluginLogger?.error(`Invalid HTTP method: ${route.method}`);
                }
              } catch (routeError: any) {
                pluginLogger?.error(`Error registering route: ${routeError.message}`);
              }
            });

            // Add a middleware to log requests
            expressInstance.use(basePath, (req, res, next) => {
              pluginLogger?.info(`Request: ${req.method} ${req.url}`);
              next();
            });

            // Mount the router on the express app
            expressInstance.use(basePath, router);
            pluginLogger?.info(`Mounted routes at ${basePath}`);
          } else {
            pluginLogger?.error(`Express instance not available from HTTP adapter`);
          }
        } else {
          pluginLogger?.error(`HTTP adapter not available or doesn't support getInstance`);
        }
      } catch (registerError: any) {
        pluginLogger?.error(`Failed to register routes: ${registerError.message}`);
      }
    }

    logger.info('Plugin initialization completed');
  }

  private setupStaticFileServing(app: INestApplication): void {
    const httpAdapter = app.getHttpAdapter();
    if (httpAdapter && typeof httpAdapter.getInstance === 'function') {
      const expressInstance = httpAdapter.getInstance();

      if (expressInstance) {
        // Serve static files from each plugin that has a staticDir
        for (const [pluginName, manifest] of this.manifests.entries()) {
          const pluginLogger = this.pluginLoggers.get(pluginName);

          if (manifest.staticDir) {
            const staticPath = path.join(
              this.pluginsDir,
              pluginName.toLowerCase(),
              manifest.staticDir,
            );

            if (fs.existsSync(staticPath)) {
              const staticUrl = `/static-plugins/${pluginName.toLowerCase()}`;
              expressInstance.use(staticUrl, express.static(staticPath));
              pluginLogger?.info(`Serving static files from ${staticPath} at ${staticUrl}`);
            } else {
              pluginLogger?.warn(`Static directory ${staticPath} does not exist`);
            }
          }
        }
      }
    }
  }

  public getPlugins(): Map<string, Plugin> {
    return this.plugins;
  }

  public getPluginManifests(): PluginManifest[] {
    return Array.from(this.manifests.values());
  }

  public cleanup(): void {
    // Close all database connections
    for (const [pluginName, connection] of this.dbConnections.entries()) {
      try {
        const pluginLogger = this.pluginLoggers.get(pluginName);
        pluginLogger?.info(`Closing database connection`);
        connection.close();
      } catch (error: any) {
        const pluginLogger = this.pluginLoggers.get(pluginName);
        pluginLogger?.error(`Error closing database connection: ${error.message}`);
      }
    }
  }
}

export class PluginModule {
  static forRoot(pluginsDir?: string): DynamicModule {
    return {
      module: PluginModule,
      global: true,
      providers: [
        {
          provide: 'PLUGIN_SYSTEM',
          useFactory: async () => {
            const pluginSystem = PluginSystem.getInstance(pluginsDir);
            await pluginSystem.scanAndLoadPlugins();
            return pluginSystem;
          },
        },
      ],
      exports: ['PLUGIN_SYSTEM'],
    };
  }
}
