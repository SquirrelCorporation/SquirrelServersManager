import { SSHType } from 'ssm-shared-lib/distribution/enums/ansible';
import DeviceAuth from '../../../data/database/model/DeviceAuth';
import logger from '../../../logger';
import { Ansible } from '../../../types/typings';

function inventoryBuilder(devicesAuth: DeviceAuth[]) {
  logger.info(`[TRANSFORMERS][INVENTORY] - Inventory for ${devicesAuth.length} device(s)`);
  // @ts-expect-error I cannot comprehend generic typescript type
  const ansibleInventory: Ansible.Hosts = {
    _meta: { hostvars: {} },
    all: { children: [] },
  };
  devicesAuth.forEach((e) => {
    logger.info(`[TRANSFORMERS][INVENTORY] - Building inventory for ${e.device.uuid}`);
    ansibleInventory._meta.hostvars[
      `device${e.device.uuid.replaceAll('-', '')}` as keyof typeof ansibleInventory._meta.hostvars
    ] = {
      ip: [e.device.ip as string],
    };
    ansibleInventory.all.children.push(`device${e.device.uuid.replaceAll('-', '')}`);
    ansibleInventory[
      `device${e.device.uuid.replaceAll('-', '')}` as keyof typeof ansibleInventory
    ] = {
      hosts: [e.device.ip as string],
      vars: getInventoryConnectionVars(e),
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

function getAuth(deviceAuth: Partial<DeviceAuth>) {
  switch (deviceAuth.authType) {
    case SSHType.KeyBased:
      const privateKey = { ansible_ssh_private_key_file: `/tmp/${deviceAuth.device?.uuid}.key` };
      if (deviceAuth.sshKeyPass) {
        return {
          ...privateKey,
          ansible_paramiko_pass: { __ansible_vault: deviceAuth.sshKeyPass },
        };
      } else {
        return privateKey;
      }
    case SSHType.UserPassword:
      return { ansible_ssh_pass: { __ansible_vault: deviceAuth.sshPwd } };
    default:
      throw new Error('Unknown device Auth type');
  }
}

function getInventoryConnectionVars(deviceAuth: Partial<DeviceAuth>) {
  // See https://docs.ansible.com/ansible/latest/collections/ansible/builtin/paramiko_ssh_connection.html
  return {
    ansible_connection: 'paramiko',
    ansible_become_method: deviceAuth.becomeMethod,
    ansible_become_pass: { __ansible_vault: deviceAuth.becomePass },
    /* prettier-ignore */
    ansible_ssh_host_key_checking: !!deviceAuth.strictHostKeyChecking,
    ansible_user: deviceAuth.sshUser,
    ...getAuth(deviceAuth),
  };
}

export default {
  inventoryBuilder,
  inventoryBuilderForTarget,
};
