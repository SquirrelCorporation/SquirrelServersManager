/**
 * Represents the metadata for a single plugin available in a store repository.
 * Mirrors the backend interface.
 */
export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  iconUrl?: string;
  packageUrl: string;
  manifestUrl?: string;
  checksumUrl?: string;
  checksum?: string;
}

/**
 * Represents the metadata for an installed plugin, as fetched from the server.
 * Based on usage in PluginsPage.
 */
export interface InstalledPluginMetadata {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  enabled: boolean;
  permissions?: string[];
  client?: {
    hasDedicatedPage?: boolean;
    // Other client properties might exist
  };
  // Other properties like license might exist
}

/**
 * Represents the core structure of a plugin's manifest.json file.
 * Used as the return type for successful installation.
 */
export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  entryPoint: string; // Server entry point
  author?: string;
  client?: {
    // Optional client config
    remoteEntryRelativePath: string;
    exposedModule: string;
    componentName: string;
    hasDedicatedPage?: boolean;
  };
  database?: string; // Optional DB name
}

// You might already have an interface for installed plugins, e.g.:
// export interface InstalledPlugin { ... }
