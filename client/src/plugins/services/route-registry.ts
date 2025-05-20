import React from 'react';

/**
 * Route definition for plugin routes
 */
export interface RouteDefinition {
  path: string;
  exact?: boolean;
  component: React.ComponentType<any>;
  authority?: string[];
  title?: string;
  icon?: string;
  hideInMenu?: boolean;
}

/**
 * Registry for plugin routes
 */
export class RouteRegistry {
  private routes: Map<string, RouteDefinition> = new Map();
  
  /**
   * Register a route
   * @param pluginId Plugin ID
   * @param route Route definition
   */
  registerRoute(pluginId: string, route: RouteDefinition): void {
    const routeKey = `${pluginId}:${route.path}`;
    this.routes.set(routeKey, {
      ...route,
      // Add plugin prefix to path to avoid conflicts with core routes
      path: `/plugins/${pluginId}${route.path}`
    });
  }
  
  /**
   * Get all routes
   * @returns Array of registered routes
   */
  getRoutes(): RouteDefinition[] {
    return Array.from(this.routes.values());
  }
  
  /**
   * Get routes for a specific plugin
   * @param pluginId Plugin ID
   * @returns Array of routes for the plugin
   */
  getPluginRoutes(pluginId: string): RouteDefinition[] {
    return Array.from(this.routes.entries())
      .filter(([key]) => key.startsWith(`${pluginId}:`))
      .map(([_, route]) => route);
  }
  
  /**
   * Clear routes for a specific plugin
   * @param pluginId Plugin ID
   */
  clearPluginRoutes(pluginId: string): void {
    Array.from(this.routes.keys())
      .filter(key => key.startsWith(`${pluginId}:`))
      .forEach(key => this.routes.delete(key));
  }
}