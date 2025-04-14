import { request } from '@umijs/max';
import type { PluginStoreInfo } from '@/types/plugin.types';

/**
 * Plugin store API endpoints
 */
const API = {
  AVAILABLE_PLUGINS: '/api/plugins/store/available',
  REPOSITORIES: '/api/plugins/store/repositories',
  INSTALL: '/api/plugins/store/install',
  INSTALLED_PLUGINS: '/api/plugins/installed',
};

/**
 * Fetches the list of available plugins from the store repositories.
 */
export const fetchAvailablePlugins = async (): Promise<{
  data: PluginStoreInfo[];
}> => {
  return request(API.AVAILABLE_PLUGINS);
};

/**
 * Fetches the list of custom plugin repositories.
 */
export const getCustomRepositories = async (): Promise<{ data: string[] }> => {
  return request(API.REPOSITORIES);
};

/**
 * Adds a new custom plugin repository.
 */
export const addCustomRepository = async (
  url: string,
): Promise<{ data: string[] }> => {
  return request(API.REPOSITORIES, {
    method: 'POST',
    data: { url },
  });
};

/**
 * Removes a custom plugin repository.
 */
export const removeCustomRepository = async (
  url: string,
): Promise<{ data: string[] }> => {
  return request(API.REPOSITORIES, {
    method: 'DELETE',
    data: { url },
  });
};

/**
 * Installs a plugin from the given package URL.
 */
export const installPlugin = async (
  packageUrl: string,
  checksum?: string,
): Promise<void> => {
  return request(API.INSTALL, {
    method: 'POST',
    data: { packageUrl, checksum },
  });
};

/**
 * Uninstalls a plugin by its ID.
 */
export const uninstallPlugin = async (pluginId: string): Promise<void> => {
  // Assumes DELETE /api/plugins/installed/:pluginId
  return request(`${API.INSTALLED_PLUGINS}/${pluginId}`, {
    method: 'DELETE',
  });
};
