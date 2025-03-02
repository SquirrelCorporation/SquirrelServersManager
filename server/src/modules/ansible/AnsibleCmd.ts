import User from 'src/data/database/model/User';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { AnsibleVault } from '../../data/database/model/AnsibleVault';
import { Playbooks } from '../../types/typings';
import { ANSIBLE_CONFIG_FILE } from '../ansible-config/constants';
import { DEFAULT_VAULT_ID } from '../ansible-vault/ansible-vault';
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
    return `--log-level ${user?.logsLevel?.terminal || 1}`;
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

  getVaults(vaults?: Partial<AnsibleVault>[]): string {
    return vaults
      ? vaults
          .map((vault) => `--vault-id ${vault.vaultId}@ssm-ansible-vault-password-client.py`)
          .join(' ')
      : '';
  }

  buildAnsibleCmd(
    playbook: string,
    uuid: string,
    inventoryTargets: (Playbooks.All & Playbooks.HostGroups) | undefined,
    user: User,
    extraVars?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
    vaults?: AnsibleVault[],
  ) {
    const inventoryTargetsCmd = this.getInventoryTargets(inventoryTargets);
    const logLevel = this.getLogLevel(user);
    const extraVarsCmd = this.getExtraVars(extraVars);
    const ident = `--ident '${uuid}'`;
    const dryRun = this.getDryRun(mode);
    const vaultsCmd = this.getVaults([...(vaults || []), { vaultId: DEFAULT_VAULT_ID }]);

    return `${AnsibleCommandBuilder.sudo} ${AnsibleCommandBuilder.ssmApiKeyEnv}=${user.apiKey} ${AnsibleCommandBuilder.ansibleConfigKeyEnv}=${ANSIBLE_CONFIG_FILE} ANSIBLE_FORCE_COLOR=1 ${AnsibleCommandBuilder.python} ${AnsibleCommandBuilder.ansibleRunner} --playbook '${playbook}' ${ident} ${inventoryTargetsCmd} ${logLevel} ${dryRun} ${extraVarsCmd} ${vaultsCmd}`;
  }
}

export default new AnsibleCommandBuilder();
