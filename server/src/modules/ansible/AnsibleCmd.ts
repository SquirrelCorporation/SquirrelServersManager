import { API, SsmAnsible } from 'ssm-shared-lib';
import User from '../../data/database/model/User';
import { ANSIBLE_CONFIG_FILE } from '../../helpers/ansible/AnsibleConfigurationHelper';
import { Playbooks } from '../../types/typings';
import ExtraVarsTransformer from './extravars/ExtraVarsTransformer';

class AnsibleCommandBuilder {
  static readonly sudo = 'sudo';
  static readonly python = 'python3';
  static readonly ansibleRunner = 'ssm-ansible-run.py';
  static readonly ssmApiKeyEnv = 'SSM_API_KEY';
  static readonly ansibleConfigKeyEnv = 'ANSIBLE_CONFIG';

  sanitizeInventory(inventoryTargets: Playbooks.All & Playbooks.HostGroups) {
    return "'" + JSON.stringify(inventoryTargets).replaceAll('\\\\', '\\') + "'";
  }

  getInventoryTargets(inventoryTargets: (Playbooks.All & Playbooks.HostGroups) | undefined) {
    return `${inventoryTargets ? '--specific-host ' + this.sanitizeInventory(inventoryTargets) : ''}`;
  }

  getLogLevel(user: User) {
    return `--log-level ${user.logsLevel?.terminal || 1}`;
  }

  getExtraVars(extraVars?: API.ExtraVars) {
    return `${extraVars ? "--extra-vars '" + JSON.stringify(ExtraVarsTransformer.transformExtraVars(extraVars)) + "'" : ''}`;
  }

  getDryRun(mode: SsmAnsible.ExecutionMode): string {
    switch (mode) {
      case SsmAnsible.ExecutionMode.CHECK:
        return '--check';
      case SsmAnsible.ExecutionMode.CHECK_AND_DIFF:
        return '--check --diff ';
      default:
        return '';
    }
  }

  buildAnsibleCmd(
    playbook: string,
    uuid: string,
    inventoryTargets: (Playbooks.All & Playbooks.HostGroups) | undefined,
    user: User,
    extraVars?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
  ) {
    const inventoryTargetsCmd = this.getInventoryTargets(inventoryTargets);
    const logLevel = this.getLogLevel(user);
    const extraVarsCmd = this.getExtraVars(extraVars);
    const ident = `--ident '${uuid}'`;
    const dryRun = this.getDryRun(mode);

    return `${AnsibleCommandBuilder.sudo} ${AnsibleCommandBuilder.ssmApiKeyEnv}=${user.apiKey} ${AnsibleCommandBuilder.ansibleConfigKeyEnv}=${ANSIBLE_CONFIG_FILE} ANSIBLE_FORCE_COLOR=1 ${AnsibleCommandBuilder.python} ${AnsibleCommandBuilder.ansibleRunner} --playbook '${playbook}' ${ident} ${inventoryTargetsCmd} ${logLevel} ${dryRun} ${extraVarsCmd}`;
  }
}

export default new AnsibleCommandBuilder();
