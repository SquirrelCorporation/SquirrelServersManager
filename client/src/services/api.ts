import { PluginInfo } from '../types/plugin.types'; // Added PluginManifest

/**
 * Fetches the list of available plugins from the store repositories.
 */
export const fetchAvailablePlugins = async (): Promise<PluginInfo[]> => {
  const response = await fetch('/api/plugins/store/available');
  if (!response.ok) {
    throw new Error('Failed to fetch available plugins');
  }
  return response.json();
};

// Add functions for repository management
export const getCustomRepositories = async (): Promise<string[]> => {
  const response = await fetch('/api/plugins/store/repositories');
  if (!response.ok) {
    // Handle potential permission errors differently?
    throw new Error('Failed to fetch custom repositories');
  }
  return response.json();
};

export const addCustomRepository = async (url: string): Promise<string[]> => {
  const response = await fetch('/api/plugins/store/repositories', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Try to get error message
    throw new Error(errorData.message || 'Failed to add custom repository');
  }
  return response.json(); // Return the updated list
};

export const removeCustomRepository = async (
  url: string,
): Promise<string[]> => {
  const response = await fetch('/api/plugins/store/repositories', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Try to get error message
    throw new Error(errorData.message || 'Failed to remove custom repository');
  }
  return response.json(); // Return the updated list
};

// Function for installation
// Update signature to include optional checksum
export const installPlugin = async (
  packageUrl: string,
  checksum?: string,
): Promise<void> => {
  // Return void now as backend returns nothing on success
  const response = await fetch('/api/plugins/store/install', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    // Send both packageUrl and checksum
    body: JSON.stringify({ packageUrl, checksum }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to install plugin');
  }
  // No JSON to parse on success
  // return response.json(); <-- Remove this
};
