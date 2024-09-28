import { SsmAnsible } from 'ssm-shared-lib';
import DeviceAuth from '../../../data/database/model/DeviceAuth';
import logger from '../../../logger';
import { Playbooks } from '../../../types/typings';

function generateDeviceKey(uuid: string) {
  return `device${uuid.replaceAll('-', '')}`;
}

function inventoryBuilder(devicesAuth: DeviceAuth[]) {
  logger.info(`[TRANSFORMERS][INVENTORY] - Inventory for ${devicesAuth.length} device(s)`);
  // @ts-expect-error generic type
  const ansibleInventory: Playbooks.Hosts = {
    _meta: { hostvars: {} },
    all: { children: [] },
  };

  devicesAuth.forEach((deviceAuth) => {
    const { device } = deviceAuth;
    const deviceKey = generateDeviceKey(device.uuid);

    logger.info(`[TRANSFORMERS][INVENTORY] - Building inventory for ${device.uuid}`);
    ansibleInventory._meta.hostvars[deviceKey] = {
      ip: device.ip ? [device.ip] : [],
    };
    ansibleInventory.all.children.push(deviceKey);
    ansibleInventory[deviceKey] = {
      hosts: device.ip ? [device.ip] : [],
      vars: getInventoryConnectionVars(deviceAuth),
    };
  });

  logger.debug(ansibleInventory);
  return ansibleInventory;
}

function inventoryBuilderForTarget(devicesAuth: Partial<DeviceAuth>[]) {
  logger.info(`[TRANSFORMERS][INVENTORY] - Inventory for ${devicesAuth.length} device(s)`);
  const ansibleInventory: Playbooks.All & Playbooks.HostGroups = {
    // @ts-expect-error I cannot comprehend generic typescript type
    all: {},
  };
  devicesAuth.forEach((e) => {
    logger.info(`[TRANSFORMERS][INVENTORY] - Building inventory for ${e.device?.uuid}`);
    ansibleInventory[
      `device${e.device?.uuid.replaceAll('-', '')}` as keyof typeof ansibleInventory
    ] = {
      // @ts-expect-error I cannot comprehend generic typescript type
      hosts: e.device.ip as string,
      vars: getInventoryConnectionVars(e),
    };
  });
  logger.debug(ansibleInventory);
  return ansibleInventory;
}

interface Auth {
  ansible_ssh_private_key_file?: string;
  ansible_paramiko_pass?: { __ansible_vault: any };
  ansible_ssh_pass?: { __ansible_vault: any };
}

function getAuth(deviceAuth: Partial<DeviceAuth>): Auth {
  const auth: Auth = {};

  switch (deviceAuth.authType) {
    case SsmAnsible.SSHType.KeyBased:
      auth.ansible_ssh_private_key_file = `/tmp/${deviceAuth.device?.uuid}.key`;
      if (deviceAuth.sshKeyPass) {
        if (deviceAuth.sshConnection !== SsmAnsible.SSHConnection.PARAMIKO) {
          throw new Error('Ssh key is not supported for non-paramiko connection');
        }
        auth.ansible_paramiko_pass = { __ansible_vault: deviceAuth.sshKeyPass };
      }
      break;
    case SsmAnsible.SSHType.UserPassword:
      auth.ansible_ssh_pass = { __ansible_vault: deviceAuth.sshPwd };
      break;
    case SsmAnsible.SSHType.Automatic:
      // We don't need secrets for automatic authentication
      break;
    default:
      throw new Error('Unknown device Auth type');
  }

  return auth;
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

function getInventoryConnectionVars(deviceAuth: Partial<DeviceAuth>): ConnectionVars {
  // See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/paramiko_ssh_connection.html
  let connection = deviceAuth.sshConnection;
  if (!connection) {
    if (deviceAuth.authType === SsmAnsible.SSHType.Automatic) {
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

  return { ...vars, ...getAuth(deviceAuth) };
}

export default {
  inventoryBuilder,
  inventoryBuilderForTarget,
};
