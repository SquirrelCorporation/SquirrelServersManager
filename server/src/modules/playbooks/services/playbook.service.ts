import { Injectable } from '@nestjs/common';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { setToCache } from '../../../data/cache';
import { AnsibleVault } from '../../../data/database/model/AnsibleVault';
import User from '../../../data/database/model/User';
import ExtraVars from '../../../modules/ansible/extravars/ExtraVars';
import Shell from '../../../modules/shell';
import { Playbooks } from '../../../types/typings';
import { Playbook } from '../schemas/playbook.schema';
import { PlaybookRepository } from '../repositories/playbook.repository';

@Injectable()
export class PlaybookService {
  constructor(private readonly playbookRepository: PlaybookRepository) {}

  async completeExtraVar(
    playbook: Playbook,
    target: string[] | undefined,
    extraVarsForcedValues?: API.ExtraVars,
  ) {
    let substitutedExtraVars: API.ExtraVars | undefined = undefined;
    if (playbook.extraVars && playbook.extraVars.length > 0) {
      substitutedExtraVars = await ExtraVars.findValueOfExtraVars(
        playbook.extraVars,
        [...(extraVarsForcedValues || [])],
        false,
        target,
      );
    }
    return substitutedExtraVars;
  }

  async executePlaybook(
    playbook: Playbook,
    user: User,
    target: string[] | undefined,
    extraVarsForcedValues?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
  ) {
    const substitutedExtraVars: API.ExtraVars | undefined = await this.completeExtraVar(
      playbook,
      target,
      extraVarsForcedValues,
    );
    return await Shell.AnsibleShellCommandsManager.executePlaybook(
      playbook.path,
      user,
      target,
      substitutedExtraVars,
      mode,
      undefined,
      playbook.playbooksRepository?.vaults as AnsibleVault[] | undefined,
    );
  }

  async executePlaybookOnInventory(
    playbook: Playbook,
    user: User,
    inventoryTargets?: Playbooks.All & Playbooks.HostGroups,
    extraVarsForcedValues?: API.ExtraVars,
    execUuid?: string,
  ) {
    const substitutedExtraVars: API.ExtraVars | undefined = await this.completeExtraVar(
      playbook,
      undefined,
      extraVarsForcedValues,
    );
    return await Shell.AnsibleShellCommandsManager.executePlaybookOnInventory(
      playbook.path,
      user,
      inventoryTargets,
      substitutedExtraVars,
      undefined,
      undefined,
      execUuid,
      playbook.playbooksRepository?.vaults as AnsibleVault[] | undefined,
    );
  }

  async addExtraVarToPlaybook(playbook: Playbook, extraVar: API.ExtraVar) {
    if (playbook.extraVars?.some(e => e.extraVar === extraVar.extraVar)) {
      throw new Error('ExtraVar already exists');
    }
    
    const concatExtra = [
      ...(playbook.extraVars || []),
      {
        extraVar: extraVar.extraVar,
        required: extraVar.required || false,
        type: extraVar.type || SsmAnsible.ExtraVarsType.MANUAL,
        deletable: true,
      },
    ];
    
    await this.playbookRepository.updateOrCreate({
      ...playbook,
      extraVars: concatExtra,
      playableInBatch: !concatExtra.find((e) => e.type === SsmAnsible.ExtraVarsType.CONTEXT),
    });
    
    if (extraVar.type === SsmAnsible.ExtraVarsType.SHARED) {
      await setToCache(extraVar.extraVar, extraVar.value || '');
    }
  }

  async deleteExtraVarFromPlaybook(playbook: Playbook, extraVarName: string) {
    const removedVar = playbook.extraVars?.filter((e) => {
      return e.extraVar !== extraVarName;
    });
    
    await this.playbookRepository.updateOrCreate({
      ...playbook,
      extraVars: removedVar,
    });
  }
} 