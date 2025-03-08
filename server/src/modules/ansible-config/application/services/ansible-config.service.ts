import * as fs from 'fs';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SSM_DATA_PATH, SSM_INSTALL_PATH } from '../../../../config';
import { FileSystemService } from '../../../shell';
import { AnsibleConfig } from '../../presentation/interfaces/config.interface';

/**
 * Service for managing Ansible configuration
 */
@Injectable()
export class AnsibleConfigService {
  private readonly logger = new Logger(AnsibleConfigService.name);
  private readonly ANSIBLE_CONFIG_PATH = `${SSM_DATA_PATH}/config`;
  private readonly ANSIBLE_CONFIG_FILE = `${this.ANSIBLE_CONFIG_PATH}/ansible.cfg`;

  constructor(private readonly fileSystemService: FileSystemService) {
    this.ensureConfigFileExists();
  }

  /**
   * Ensures the Ansible configuration file exists, copying the default if needed
   */
  private ensureConfigFileExists(): void {
    if (!this.fileSystemService.test('-f', this.ANSIBLE_CONFIG_FILE)) {
      this.fileSystemService.createDirectory(this.ANSIBLE_CONFIG_PATH);
      this.fileSystemService.copyFile(
        `${SSM_INSTALL_PATH}/server/src/ansible/default-ansible.cfg`,
        this.ANSIBLE_CONFIG_FILE,
      );
    }
  }

  /**
   * Reads the Ansible configuration file
   * @returns The parsed Ansible configuration
   */
  readConfig(): AnsibleConfig {
    try {
      const configContent = fs.readFileSync(this.ANSIBLE_CONFIG_FILE, 'utf-8');
      const lines = configContent.split('\n');
      const config: AnsibleConfig = {};
      let currentSection: string | null = null;
      let currentDescription: string[] = [];

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('[') && trimmedLine.endsWith(']')) {
          currentSection = trimmedLine.slice(1, -1);
          config[currentSection] = config[currentSection] || {};
          currentDescription = [];
        } else if (currentSection) {
          if (trimmedLine.startsWith('# ')) {
            currentDescription.push(trimmedLine.slice(2).trim());
          } else if (trimmedLine.startsWith(';')) {
            const [keyPart, ...valueParts] = trimmedLine.slice(1).split('=');
            const key = keyPart.trim();
            const value = valueParts.join('=').trim();
            config[currentSection][key] = {
              value,
              deactivated: true,
              description: currentDescription.join('\n'),
            };
            currentDescription = [];
          } else if (trimmedLine && trimmedLine.includes('=')) {
            const [key, ...valueParts] = line.split('=');
            const fullKey = key.trim();
            const fullValue = valueParts.join('=').trim();
            config[currentSection][fullKey] = {
              value: fullValue,
              deactivated: false,
              description: currentDescription.join('\n'),
            };
            currentDescription = [];
          }
        }
      });

      return config;
    } catch (error: any) {
      this.logger.error(`Error reading Ansible configuration: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error reading Ansible configuration file');
    }
  }

  /**
   * Writes the Ansible configuration to file
   * @param config The configuration to write
   */
  writeConfig(config: AnsibleConfig): void {
    try {
      const newLines: string[] = [];
      Object.entries(config).forEach(([section, keys]) => {
        newLines.push(`[${section}]`);
        Object.entries(keys).forEach(([key, entry]) => {
          if (entry.description) {
            newLines.push(...entry.description.split('\n').map((desc) => `# ${desc}`));
          }
          newLines.push(`${entry.deactivated ? ';' : ''}${key}=${entry.value}`);
        });
        newLines.push(''); // Add a blank line after each section for readability
      });

      fs.writeFileSync(this.ANSIBLE_CONFIG_FILE, newLines.join('\n'), 'utf-8');
    } catch (error: any) {
      this.logger.error(`Error writing Ansible configuration: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error writing Ansible configuration file');
    }
  }

  /**
   * Validates a section name to prevent prototype pollution
   * @param section The section name to validate
   */
  private validateSectionName(section: string): void {
    if (section === '__proto__' || section === 'constructor' || section === 'prototype') {
      throw new ForbiddenException('Invalid section name');
    }
  }

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
    description: string,
  ): void {
    this.validateSectionName(section);

    try {
      const config = this.readConfig();

      if (!config[section]) {
        config[section] = {};
      }

      config[section][key] = { value, deactivated, description };
      this.writeConfig(config);
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error creating configuration entry: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating the configuration file');
    }
  }

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
    description: string,
  ): void {
    this.validateSectionName(section);

    try {
      const config = this.readConfig();

      // Ensure section exists even if it's empty
      if (!config[section]) {
        config[section] = {};
      }

      config[section][key] = { value, deactivated, description };

      // Assign an empty object to the section if it has no keys left
      if (Object.keys(config[section]).length === 0) {
        config[section] = {};
      }

      this.writeConfig(config);
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error(`Error updating configuration entry: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error updating the configuration file');
    }
  }

  /**
   * Deletes a configuration entry
   * @param section Section name
   * @param key Key name
   */
  deleteConfigEntry(section: string, key: string): void {
    this.validateSectionName(section);

    try {
      const config = this.readConfig();

      if (config[section] && config[section][key] !== undefined) {
        delete config[section][key];

        // Remove the section if it's empty
        if (Object.keys(config[section]).length === 0) {
          delete config[section];
        }

        this.writeConfig(config);
      } else {
        throw new NotFoundException('Section or key not found');
      }
    } catch (error: any) {
      if (error instanceof ForbiddenException || error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error(`Error deleting configuration entry: ${error.message}`, error.stack);
      throw new InternalServerErrorException('Error deleting from the configuration file');
    }
  }
}
