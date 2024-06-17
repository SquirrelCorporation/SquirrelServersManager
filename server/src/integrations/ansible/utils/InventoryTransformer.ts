import { SsmAnsible } from 'ssm-shared-lib';
import DeviceAuth from '../../../data/database/model/DeviceAuth';
import logger from '../../../logger';
import { Ansible } from '../../../types/typings';

function generateDeviceKey(uuid: string) {
  return `device${uuid.replaceAll('-', '')}`;
}

function inventoryBuilder(devicesAuth: DeviceAuth[]) {
  logger.info(`[TRANSFORMERS][INVENTORY] - Inventory for ${devicesAuth.length} device(s)`);
  // @ts-expect-error
  const ansibleInventory: Ansible.Hosts = {
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
  const ansibleInventory: Ansible.All & Ansible.HostGroups = {
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
  logger.info(ansibleInventory);
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
        auth.ansible_paramiko_pass = { __ansible_vault: deviceAuth.sshKeyPass };
      }
      break;
    case SsmAnsible.SSHType.UserPassword:
      auth.ansible_ssh_pass = { __ansible_vault: deviceAuth.sshPwd };
      break;
    default:
      throw new Error('Unknown device Auth type');
  }

  return auth;
}

interface ConnectionVars {
  ansible_connection: string;
  ansible_become_method: any;
  ansible_become_pass: { __ansible_vault: any };
  ansible_ssh_host_key_checking: boolean;
  ansible_user: any;
}

function getInventoryConnectionVars(deviceAuth: Partial<DeviceAuth>): ConnectionVars {
  // See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/paramiko_ssh_connection.html
  const vars: ConnectionVars = {
    ansible_connection: 'paramiko',
    ansible_become_method: deviceAuth.becomeMethod,
    ansible_become_pass: { __ansible_vault: deviceAuth.becomePass },
    ansible_ssh_host_key_checking: !!deviceAuth.strictHostKeyChecking,
    ansible_user: deviceAuth.sshUser,
  };

  return { ...vars, ...getAuth(deviceAuth) };
}

export default {
  inventoryBuilder,
  inventoryBuilderForTarget,
};
