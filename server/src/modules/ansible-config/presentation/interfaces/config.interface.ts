/**
 * Interface for a single configuration entry
 */
export interface ConfigEntry {
  value: string;
  deactivated: boolean;
  description?: string;
}

/**
 * Interface for the complete Ansible configuration
 */
export interface AnsibleConfig {
  [section: string]: {
    [key: string]: ConfigEntry;
  };
}
