import User from '../database/model/User';
import { Ansible } from '../transformers/typings';

const sudo = 'sudo';
const python = 'python3';
const ansibleRunner = 'ssm-ansible-run.py';

function sanitizeInventory(inventoryTargets: Ansible.All & Ansible.HostGroups) {
  return JSON.stringify(inventoryTargets).replaceAll('\\\\', '\\') + "'";
}

function getInventoryTargets(inventoryTargets: Ansible.All & Ansible.HostGroups) {
  return `${inventoryTargets ? "--specific-host '" + sanitizeInventory(inventoryTargets) : ''}`;
}

function getLogLevel(user: User) {
  return `--log-level ${user.logsLevel?.terminal || 1}`;
}

function buildAnsibleCmd(
  playbook: string,
  inventoryTargets: Ansible.All & Ansible.HostGroups,
  user: User,
) {
  const inventoryTargetsCmd = getInventoryTargets(inventoryTargets);
  const logLevel = getLogLevel(user);
  return `${sudo} ${python} ${ansibleRunner} --playbook ${playbook} ${inventoryTargetsCmd} ${logLevel}`;
}

export default {
  buildAnsibleCmd,
};
