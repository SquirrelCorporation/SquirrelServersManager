import { API } from 'ssm-shared-lib';
import User from '../../data/database/model/User';
import { Ansible } from '../../types/typings';
import ExtraVarsTransformer from './transformers/ExtraVarsTransformer';

const sudo = 'sudo';
const python = 'python3';
const ansibleRunner = 'ssm-ansible-run.py';
const ssmApiKeyEnv = 'SSM_API_KEY';

function sanitizeInventory(inventoryTargets: Ansible.All & Ansible.HostGroups) {
  return "'" + JSON.stringify(inventoryTargets).replaceAll('\\\\', '\\') + "'";
}

function getInventoryTargets(inventoryTargets: (Ansible.All & Ansible.HostGroups) | undefined) {
  return `${inventoryTargets ? '--specific-host ' + sanitizeInventory(inventoryTargets) : ''}`;
}

function getLogLevel(user: User) {
  return `--log-level ${user.logsLevel?.terminal || 1}`;
}

function getExtraVars(extraVars?: API.ExtraVars) {
  return `${extraVars ? "--extra-vars '" + JSON.stringify(ExtraVarsTransformer.transformExtraVars(extraVars)) + "'" : ''}`;
}

function buildAnsibleCmd(
  playbook: string,
  uuid: string,
  inventoryTargets: (Ansible.All & Ansible.HostGroups) | undefined,
  user: User,
  extraVars?: API.ExtraVars,
) {
  const inventoryTargetsCmd = getInventoryTargets(inventoryTargets);
  const logLevel = getLogLevel(user);
  const extraVarsCmd = getExtraVars(extraVars);
  const ident = `--ident '${uuid}'`;
  return `${sudo} ${ssmApiKeyEnv}=${user.apiKey} ${python} ${ansibleRunner} --playbook ${playbook} ${ident} ${inventoryTargetsCmd} ${logLevel} ${extraVarsCmd}`;
}

export default {
  buildAnsibleCmd,
  sanitizeInventory,
  getInventoryTargets,
  getLogLevel,
  getExtraVars,
};
