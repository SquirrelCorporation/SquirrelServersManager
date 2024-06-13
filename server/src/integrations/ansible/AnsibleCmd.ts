import { API } from 'ssm-shared-lib';
import User from '../../data/database/model/User';
import { Ansible } from '../../types/typings';
import ExtraVarsTransformer from './utils/ExtraVarsTransformer';

class AnsibleCommandBuilder {
  static readonly sudo = 'sudo';
  static readonly python = 'python3';
  static readonly ansibleRunner = 'ssm-ansible-run.py';
  static readonly ssmApiKeyEnv = 'SSM_API_KEY';

  sanitizeInventory(inventoryTargets: Ansible.All & Ansible.HostGroups) {
    return "'" + JSON.stringify(inventoryTargets).replaceAll('\\\\', '\\') + "'";
  }

  getInventoryTargets(inventoryTargets: (Ansible.All & Ansible.HostGroups) | undefined) {
    return `${inventoryTargets ? '--specific-host ' + this.sanitizeInventory(inventoryTargets) : ''}`;
  }

  getLogLevel(user: User) {
    return `--log-level ${user.logsLevel?.terminal || 1}`;
  }

  getExtraVars(extraVars?: API.ExtraVars) {
    return `${extraVars ? "--extra-vars '" + JSON.stringify(ExtraVarsTransformer.transformExtraVars(extraVars)) + "'" : ''}`;
  }

  buildAnsibleCmd(
    playbook: string,
    uuid: string,
    inventoryTargets: (Ansible.All & Ansible.HostGroups) | undefined,
    user: User,
    extraVars?: API.ExtraVars,
  ) {
    const inventoryTargetsCmd = this.getInventoryTargets(inventoryTargets);
    const logLevel = this.getLogLevel(user);
    const extraVarsCmd = this.getExtraVars(extraVars);
    const ident = `--ident '${uuid}'`;

    return `${AnsibleCommandBuilder.sudo} ${AnsibleCommandBuilder.ssmApiKeyEnv}=${user.apiKey} ${AnsibleCommandBuilder.python} ${AnsibleCommandBuilder.ansibleRunner} --playbook ${playbook} ${ident} ${inventoryTargetsCmd} ${logLevel} ${extraVarsCmd}`;
  }
}

export default new AnsibleCommandBuilder();
