import { Injectable, Logger } from '@nestjs/common';
import { SsmAnsible } from 'ssm-shared-lib';
import { Playbooks } from '../../../../types/typings';
import { SshKeyService } from '../../../shell';
import { IDeviceAuth } from '../../../devices';

interface Auth {
  ansible_ssh_private_key_file?: string;
  ansible_paramiko_pass?: { __ansible_vault: any };
  ansible_ssh_pass?: { __ansible_vault: any };
}

interface ConnectionVars {
  ansible_connection: string;
  ansible_become_method: any;
  ansible_become_user?: string;
  ansible_become_pass: { __ansible_vault: any };
  ansible_ssh_host_key_checking: boolean;
  ansible_user?: string;
  ansible_ssh_port?: number;
}

/**
 * Service for transforming device data into Ansible inventory format
 */
@Injectable()
export class InventoryTransformerService {
  private readonly logger = new Logger(InventoryTransformerService.name);

  constructor(private readonly sshKeyService: SshKeyService) {}

  /**
   * Generate a device key from the UUID
   */
  private generateDeviceKey(uuid: string): string {
    return `device${uuid.replaceAll('-', '')}`;
  }

  /**
   * Build Ansible inventory for multiple devices
   */
  async inventoryBuilder(devicesAuth: IDeviceAuth[], execUuid: string): Promise<Playbooks.Hosts> {
    this.logger.log(`Inventory for ${devicesAuth.length} device(s)`);
    // @ts-expect-error generic type
    const ansibleInventory: Playbooks.Hosts = {
      _meta: { hostvars: {} },
      all: { children: [] },
    };

    for (const deviceAuth of devicesAuth) {
      const device =
        typeof deviceAuth.device === 'string'
          ? { uuid: deviceAuth.device, ip: '' }
          : deviceAuth.device;
      const deviceKey = this.generateDeviceKey(device.uuid);

      this.logger.log(`Building inventory for ${device.uuid}`);
      ansibleInventory._meta.hostvars[deviceKey] = {
        ip: device.ip ? [device.ip] : [],
      };
      ansibleInventory.all.children.push(deviceKey);
      ansibleInventory[deviceKey] = {
        hosts: device.ip ? [device.ip] : [],
        vars: await this.getInventoryConnectionVars(deviceAuth, execUuid),
      };
    }

    this.logger.debug(`Inventory: ${JSON.stringify(ansibleInventory)}`);
    return ansibleInventory;
  }

  /**
   * Build Ansible inventory for specific target devices
   */
  async inventoryBuilderForTarget(
    devicesAuth: Partial<IDeviceAuth>[],
    execUuid: string,
  ): Promise<Playbooks.All & Playbooks.HostGroups> {
    this.logger.log(`Inventory for ${devicesAuth.length} device(s)`);
    const ansibleInventory: Playbooks.All & Playbooks.HostGroups = {
      // @ts-expect-error I cannot comprehend generic typescript type
      all: {},
    };

    for (const deviceAuth of devicesAuth) {
      const device =
        typeof deviceAuth.device === 'string'
          ? { uuid: deviceAuth.device, ip: '' }
          : deviceAuth.device;

      this.logger.log(`Building inventory for ${device?.uuid}`);
      ansibleInventory[
        `device${device?.uuid.replaceAll('-', '')}` as keyof typeof ansibleInventory
      ] = {
        // @ts-expect-error I cannot comprehend generic typescript type
        hosts: device.ip as string,
        vars: await this.getInventoryConnectionVars(deviceAuth, execUuid),
      };
    }

    this.logger.debug(`Inventory: ${JSON.stringify(ansibleInventory)}`);
    return ansibleInventory;
  }

  /**
   * Get authentication configuration for Ansible inventory
   */
  private async getAuth(deviceAuth: Partial<IDeviceAuth>, execUuid: string): Promise<Auth> {
    const auth: Auth = {};

    switch (deviceAuth.authType) {
      case SsmAnsible.SSHType.KeyBased: {
        const deviceId =
          typeof deviceAuth.device === 'string' ? deviceAuth.device : deviceAuth.device?.uuid;
        auth.ansible_ssh_private_key_file = await this.sshKeyService.genAnsibleTemporaryPrivateKey(
          deviceAuth.sshKey as string,
          deviceId as string,
          execUuid,
        );
        if (deviceAuth.sshKeyPass) {
          if (deviceAuth.sshConnection !== SsmAnsible.SSHConnection.PARAMIKO) {
            throw new Error('Ssh key is not supported for non-paramiko connection');
          }
          auth.ansible_paramiko_pass = { __ansible_vault: deviceAuth.sshKeyPass };
        }
        break;
      }
      case SsmAnsible.SSHType.UserPassword:
        auth.ansible_ssh_pass = { __ansible_vault: deviceAuth.sshPwd };
        break;
      case SsmAnsible.SSHType.PasswordLess:
        // We don't need secrets for passwordless authentication
        break;
      default:
        throw new Error('Unknown device Auth type');
    }

    return auth;
  }

  /**
   * Get connection variables for Ansible inventory
   */
  private async getInventoryConnectionVars(
    deviceAuth: Partial<IDeviceAuth>,
    execUuid: string,
  ): Promise<ConnectionVars> {
    // See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/paramiko_ssh_connection.html
    let connection = deviceAuth.sshConnection;
    if (!connection) {
      if (deviceAuth.authType === SsmAnsible.SSHType.PasswordLess) {
        // Paramiko does not work without a password or key
        connection = SsmAnsible.SSHConnection.BUILTIN;
      } else {
        connection = SsmAnsible.SSHConnection.PARAMIKO;
      }
    }

    const vars: ConnectionVars = {
      ansible_connection: connection,
      ansible_become_method: deviceAuth.becomeMethod,
      ansible_become_user: deviceAuth.becomeUser,
      ansible_become_pass: { __ansible_vault: deviceAuth.becomePass },
      ansible_ssh_host_key_checking: !!deviceAuth.strictHostKeyChecking,
      ansible_user: deviceAuth.sshUser,
      ansible_ssh_port: deviceAuth.sshPort,
    };

    return { ...vars, ...(await this.getAuth(deviceAuth, execUuid)) };
  }
}
