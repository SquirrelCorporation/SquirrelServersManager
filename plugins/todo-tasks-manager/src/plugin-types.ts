import { INestApplication } from '@nestjs/common';
import { Connection } from 'mongoose';

/**
 * Interface for plugin route definitions
 */
export interface RouteDefinition {
  path: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
  handler: (req: any, res: any) => void;
  description?: string;
}

/**
 * Interface for the plugin logger
 */
export interface PluginLogger {
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

/**
 * Context provided to plugins during initialization
 */
export interface PluginContext {
  dbConnection?: Connection; // Database connection if requested in manifest
  logger: PluginLogger; // Logger for the plugin
}

/**
 * Interface that all plugins must implement
 */
export interface Plugin {
  /**
   * Called when the plugin is being initialized
   * @param app The NestJS application instance
   * @param context Context containing resources for the plugin
   */
  register(app: INestApplication, context: PluginContext): Promise<void>;
  
  /**
   * Optional method to register routes for the plugin
   * @returns Array of route definitions or a promise that resolves to an array of route definitions
   */
  registerRoutes?(): RouteDefinition[] | Promise<RouteDefinition[]>;
} 