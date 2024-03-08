import User from '../../database/model/User';
import { Ansible } from '../../typings';
import ExtraVarsTransformer from './transformers/ExtraVarsTransformer';

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

function getExtraVars(extraVars?: Ansible.ExtraVars) {
  return `${extraVars ? "--extra-vars '" + JSON.stringify(ExtraVarsTransformer.transformExtraVars(extraVars)) + "'" : ''}`;
}

function buildAnsibleCmd(
  playbook: string,
  inventoryTargets: Ansible.All & Ansible.HostGroups,
  user: User,
  extraVars?: Ansible.ExtraVars,
) {
  const inventoryTargetsCmd = getInventoryTargets(inventoryTargets);
  const logLevel = getLogLevel(user);
  const extraVarsCmd = getExtraVars(extraVars);
  return `${sudo} ${python} ${ansibleRunner} --playbook ${playbook} ${inventoryTargetsCmd} ${logLevel} ${extraVarsCmd}`;
}

export default {
  buildAnsibleCmd,
};
