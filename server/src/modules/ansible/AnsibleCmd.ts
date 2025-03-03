import { ModuleRef } from '@nestjs/core';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { AnsibleVault } from '../../data/database/model/AnsibleVault';
import User from '../../data/database/model/User';
import { Playbooks } from '../../types/typings';
import { AnsibleCommandBuilderService } from './services/ansible-command-builder.service';

/**
 * This is a bridge class that provides a static interface to the AnsibleCommandBuilderService
 * for backward compatibility with existing code.
 */
class AnsibleCmd {
  private static ansibleCommandBuilderService: AnsibleCommandBuilderService;
  private static moduleRef: ModuleRef;

  /**
   * Set the ModuleRef to allow access to the NestJS dependency injection container
   */
  static setModuleRef(moduleRef: ModuleRef): void {
    AnsibleCmd.moduleRef = moduleRef;
  }

  /**
   * Get the AnsibleCommandBuilderService instance
   */
  private static getService(): AnsibleCommandBuilderService {
    if (!AnsibleCmd.ansibleCommandBuilderService) {
      if (!AnsibleCmd.moduleRef) {
        throw new Error('ModuleRef not set in AnsibleCmd');
      }
      AnsibleCmd.ansibleCommandBuilderService = AnsibleCmd.moduleRef.get(
        AnsibleCommandBuilderService,
        { strict: false },
      );
    }
    return AnsibleCmd.ansibleCommandBuilderService;
  }

  /**
   * Build Ansible command
   */
  static buildAnsibleCmd(
    playbook: string,
    uuid: string,
    inventoryTargets: (Playbooks.All & Playbooks.HostGroups) | undefined,
    user: User,
    extraVars?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
    vaults?: AnsibleVault[],
  ): string {
    return AnsibleCmd.getService().buildAnsibleCmd(
      playbook,
      uuid,
      inventoryTargets,
      user,
      extraVars,
      mode,
      vaults,
    );
  }
}

export default AnsibleCmd;
