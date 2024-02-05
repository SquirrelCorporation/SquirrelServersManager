import DeviceAuth, { SSHType } from '../database/model/DeviceAuth';
import DeviceAuthRepo from '../database/repository/DeviceAuthRepo';
import logger from '../logger';
import { Ansible } from './typings';

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
      vars: getInventoryConnectionVars(e, false),
    };
  });
  logger.debug(ansibleInventory);
  return ansibleInventory;
}

function inventoryBuilderForTarget(devicesAuth: DeviceAuth[]) {
  logger.info(`[TRANSFORMERS][INVENTORY] - Inventory for ${devicesAuth.length} device(s)`);
  const ansibleInventory: Ansible.All & Ansible.HostGroups = {
    all: {},
  };
  devicesAuth.forEach((e) => {
    logger.info(`[TRANSFORMERS][INVENTORY] - Building inventory for ${e.device.uuid}`);
    /*   ansibleInventory.all[
      `host${e.device.uuid.replaceAll('-', '')}` as keyof typeof ansibleInventory
    ] = `device${e.device.uuid.replaceAll('-', '')}`;*/
    ansibleInventory[
      `device${e.device.uuid.replaceAll('-', '')}` as keyof typeof ansibleInventory
    ] = {
      hosts: e.device.ip as string,
      vars: getInventoryConnectionVars(e, true),
    };
  });
  logger.info(ansibleInventory);
  return ansibleInventory;
}

function getInventoryConnectionVars(deviceAuth: DeviceAuth, escape: boolean) {
  return {
    ansible_connection: 'ssh',
    ansible_become: 'yes',
    ansible_become_method: 'sudo',
    /* prettier-ignore */
    ansible_ssh_extra_args: "'" + (escape ? "\\" + "''" : '') + "-o StrictHostKeyChecking=no" + "'" + (escape ? "\\" + "''" : ''),
    ansible_user: deviceAuth.type === SSHType.UserPassword ? deviceAuth.sshUser : undefined,
    ansible_ssh_pass: deviceAuth.type === SSHType.UserPassword ? deviceAuth.sshPwd : undefined,
  };
}

export default {
  inventoryBuilder,
  inventoryBuilderForTarget,
};
