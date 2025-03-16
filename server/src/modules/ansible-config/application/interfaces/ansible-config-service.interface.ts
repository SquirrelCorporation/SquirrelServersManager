import { AnsibleConfig } from '../../presentation/interfaces/config.interface';

export const ANSIBLE_CONFIG_SERVICE = 'ANSIBLE_CONFIG_SERVICE';

/**
 * Interface for the Ansible Config Service
 */
export interface IAnsibleConfigService {
  /**
   * Reads the Ansible configuration file
   * @returns The parsed Ansible configuration
   */
  readConfig(): AnsibleConfig;

  /**
   * Writes the Ansible configuration to file
   * @param config The configuration to write
   */
  writeConfig(config: AnsibleConfig): void;

  /**
   * Creates a new configuration entry
   * @param section Section name
   * @param key Key name
   * @param value Value
   * @param deactivated Whether the entry is deactivated (commented out)
   * @param description Description of the entry
   */
  createConfigEntry(
    section: string,
    key: string,
    value: string,
    deactivated: boolean,
    description: string
  ): void;

  /**
   * Updates an existing configuration entry
   * @param section Section name
   * @param key Key name
   * @param value Value
   * @param deactivated Whether the entry is deactivated (commented out)
   * @param description Description of the entry
   */
  updateConfigEntry(
    section: string,
    key: string,
    value: string,
    deactivated: boolean,
    description: string
  ): void;

  /**
   * Deletes a configuration entry
   * @param section Section name
   * @param key Key name
   */
  deleteConfigEntry(section: string, key: string): void;
}