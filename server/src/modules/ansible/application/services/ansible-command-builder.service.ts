import { ANSIBLE_CONFIG_FILE } from '@modules/ansible-config';
import { DEFAULT_VAULT_ID, IAnsibleVault } from '@modules/ansible-vaults';
import {
  IAnsibleCommandBuilderService
} from '@modules/ansible/doma../../domain/interfaces/ansible-command-builder-service.interface';
import { IUser } from '@modules/users';
import { Inject, Injectable } from '@nestjs/common';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { Playbooks } from '../../../../types/typings';
import { ExtraVarsTransformerService } from './extra-vars-transformer.service';

/**
 * Service for building Ansible commands
 */
@Injectable()
export class AnsibleCommandBuilderService implements IAnsibleCommandBuilderService {
  private static readonly sudo = 'sudo';
  private static readonly python = 'python3';
  private static readonly ansibleRunner = 'ssm-ansible-run.py';
  private static readonly ssmApiKeyEnv = 'SSM_API_KEY';
  private static readonly ansibleConfigKeyEnv = 'ANSIBLE_CONFIG';

  constructor(
    private readonly extraVarsTransformer: ExtraVarsTransformerService,
    @Inject(DEFAULT_VAULT_ID) private readonly defaultVaultId: string,
  ) {}

  /**
   * Sanitize inventory targets for Ansible
   */
  sanitizeInventory(inventoryTargets: Playbooks.All & Playbooks.HostGroups): string {
    return "'" + JSON.stringify(inventoryTargets).replaceAll('\\\\', '\\') + "'";
  }

  /**
   * Get inventory targets command line argument
   */
  getInventoryTargets(inventoryTargets?: Playbooks.All & Playbooks.HostGroups): string {
    return `${
      inventoryTargets ? '--specific-host ' + this.sanitizeInventory(inventoryTargets) : ''
    }`;
  }

  /**
   * Get log level command line argument
   */
  getLogLevel(user: IUser): string {
    return `--log-level ${user?.logsLevel?.terminal || 1}`;
  }

  /**
   * Get extra vars command line argument
   */
  getExtraVars(extraVars?: API.ExtraVars): string {
    return `${
      extraVars
        ? "--extra-vars '" +
          JSON.stringify(this.extraVarsTransformer.transformExtraVars(extraVars)) +
          "'"
        : ''
    }`;
  }

  /**
   * Get dry run command line argument based on execution mode
   */
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

  /**
   * Get vaults command line argument
   */
  getVaults(vaults?: Partial<IAnsibleVault>[]): string {
    return vaults
      ? vaults
          .map((vault) => `--vault-id ${vault.vaultId}@ssm-ansible-vault-password-client.py`)
          .join(' ')
      : '';
  }

  /**
   * Build the full Ansible command
   */
  buildAnsibleCmd(
    playbook: string,
    uuid: string,
    inventoryTargets: (Playbooks.All & Playbooks.HostGroups) | undefined,
    user: IUser,
    extraVars?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
    vaults?: IAnsibleVault[],
  ): string {
    const inventoryTargetsCmd = this.getInventoryTargets(inventoryTargets);
    const logLevel = this.getLogLevel(user);
    const extraVarsCmd = this.getExtraVars(extraVars);
    const ident = `--ident '${uuid}'`;
    const dryRun = this.getDryRun(mode);
    const vaultsCmd = this.getVaults([...(vaults || []), { vaultId: this.defaultVaultId }]);

    return `${AnsibleCommandBuilderService.sudo} ${AnsibleCommandBuilderService.ssmApiKeyEnv}=${
      user.apiKey
    } ${AnsibleCommandBuilderService.ansibleConfigKeyEnv}=${ANSIBLE_CONFIG_FILE} ANSIBLE_FORCE_COLOR=1 ${
      AnsibleCommandBuilderService.python
    } ${AnsibleCommandBuilderService.ansibleRunner} --playbook '${playbook}' ${ident} ${inventoryTargetsCmd} ${logLevel} ${dryRun} ${extraVarsCmd} ${vaultsCmd}`;
  }
}
