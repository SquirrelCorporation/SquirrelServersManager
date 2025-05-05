import { request } from '@/services/request';

/**
 * Get all plugins
 * @returns Promise with response
 */
export async function getPlugins() {
  try {
    // Try with the correct path
    return await request.get('/api/plugins');
  } catch (error) {
    console.error('Failed to get plugins:', error);
    // Return empty array to prevent further errors
    return { data: [] };
  }
}

/**
 * Get a plugin by ID
 * @param id Plugin ID
 * @returns Promise with response
 */
export async function getPlugin(id: string) {
  return request.get(`/api/plugins/${id}`);
}

/**
 * Enable a plugin
 * @param id Plugin ID
 * @returns Promise with response
 */
export async function enablePlugin(id: string) {
  return request.put(`/api/plugins/${id}/enable`);
}

/**
 * Disable a plugin
 * @param id Plugin ID
 * @returns Promise with response
 */
export async function disablePlugin(id: string) {
  return request.put(`/api/plugins/${id}/disable`);
}

/**
 * Get plugin settings
 * @param id Plugin ID
 * @returns Promise with response
 */
export async function getPluginSettings(id: string) {
  return request.get(`/api/plugins/${id}/settings`);
}

/**
 * Update plugin settings
 * @param id Plugin ID
 * @param settings Plugin settings
 * @returns Promise with response
 */
export async function updatePluginSettings(id: string, settings: any) {
  return request.put(`/api/plugins/${id}/settings`, settings);
} 