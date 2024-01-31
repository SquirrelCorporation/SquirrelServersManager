import DeviceAuth, { SSHType } from '../database/model/DeviceAuth';
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
    ansibleInventory._meta.hostvars[e.device.uuid as keyof typeof ansibleInventory._meta.hostvars] =
      {
        ip: [e.device.ip as string],
      };
    ansibleInventory.all.children.push(e.device.uuid);
    ansibleInventory[e.device.uuid as keyof typeof ansibleInventory] = {
      hosts: [e.device.ip as string],
      vars: {
        ansible_connection: 'ssh',
        ansible_become: 'yes',
        ansible_become_method: 'sudo',
        ansible_ssh_extra_args: "'-o StrictHostKeyChecking=no'",
        ansible_user: e.type === SSHType.UserPassword ? e.sshUser : undefined,
        ansible_ssh_pass: e.type === SSHType.UserPassword ? e.sshPwd : undefined,
      },
    };
  });
  return ansibleInventory;
}

export default {
  inventoryBuilder,
};
