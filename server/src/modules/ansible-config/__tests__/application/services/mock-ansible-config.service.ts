import { FileSystemService } from '@modules/shell/application/services/file-system.service';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AnsibleConfigService } from '../../../application/services/ansible-config.service';
import { AnsibleConfig } from '../../../presentation/interfaces/config.interface';

// Create a test version of the service for unit testing
export class MockAnsibleConfigService extends AnsibleConfigService {
  private mockConfig: AnsibleConfig = {
    defaults: {
      host_key_checking: {
        value: 'False',
        deactivated: false,
        description: 'Host key checking setting',
      },
      inventory: {
        value: '/etc/ansible/hosts',
        deactivated: true,
        description: 'Default inventory file',
      },
    },
    ssh_connection: {
      pipelining: {
        value: 'True',
        deactivated: false,
        description: 'SSH pipelining',
      },
    },
  };

  constructor(fileSystemService: FileSystemService) {
    super(fileSystemService);
  }

  // Override the readConfig method for testing
  readConfig(): AnsibleConfig {
    try {
      return JSON.parse(JSON.stringify(this.mockConfig));
    } catch (error: any) {
      throw new InternalServerErrorException('Error reading Ansible configuration file');
    }
  }

  // Override the writeConfig method for testing
  writeConfig(config: AnsibleConfig): void {
    try {
      this.mockConfig = JSON.parse(JSON.stringify(config));
    } catch (error: any) {
      throw new InternalServerErrorException('Error writing Ansible configuration file');
    }
  }

  // Keep the same validation logic
  private validateSectionName(section: string): void {
    if (section === '__proto__' || section === 'constructor' || section === 'prototype') {
      throw new ForbiddenException('Invalid section name');
    }
  }

  // The rest of the methods can remain the same as they rely on readConfig and writeConfig
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
      throw new InternalServerErrorException('Error updating the configuration file');
    }
  }

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

      if (!config[section]) {
        config[section] = {};
      }

      config[section][key] = { value, deactivated, description };

      if (Object.keys(config[section]).length === 0) {
        config[section] = {};
      }

      this.writeConfig(config);
    } catch (error: any) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new InternalServerErrorException('Error updating the configuration file');
    }
  }

  deleteConfigEntry(section: string, key: string): void {
    this.validateSectionName(section);

    try {
      const config = this.readConfig();

      if (config[section] && config[section][key] !== undefined) {
        delete config[section][key];

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
      throw new InternalServerErrorException('Error deleting from the configuration file');
    }
  }
}
