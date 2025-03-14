import { Inject, Injectable } from '@nestjs/common';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { AnsibleCommandService, ExtraVarsService } from '@modules/ansible';
import { IAnsibleVault } from '@modules/ansible-vault';
import { IUser } from '@modules/users/domain/entities/user.entity';
import { IShellWrapperService } from '@modules/shell';
import { ICacheService } from '@infrastructure/cache';
import { IPlaybook } from '@modules/playbooks/domain/entities/playbook.entity';
import { Playbooks } from 'src/types/typings';
import { IPlaybookRepository, PLAYBOOK_REPOSITORY } from '../../domain/repositories/playbook-repository.interface';

@Injectable()
export class PlaybookService {
  constructor(
    @Inject(PLAYBOOK_REPOSITORY)
    private readonly playbookRepository: IPlaybookRepository,
    @Inject('ICacheService') private readonly cacheService: ICacheService,
    @Inject('SHELL_WRAPPER_SERVICE') private readonly shellWrapperService: IShellWrapperService,
    private readonly extraVarsService: ExtraVarsService,
    private readonly ansibleCommandService: AnsibleCommandService
  ) {}

  async completeExtraVar(
    playbook: IPlaybook,
    target: string[] | undefined,
    extraVarsForcedValues?: API.ExtraVars,
  ) {
    let substitutedExtraVars: API.ExtraVars | undefined = undefined;
    if (playbook.extraVars && playbook.extraVars.length > 0) {
      substitutedExtraVars = await this.extraVarsService.findValueOfExtraVars(
        playbook.extraVars,
        [...(extraVarsForcedValues || [])],
        false,
        target,
      );
    }
    return substitutedExtraVars;
  }

  async executePlaybook(
    playbook: IPlaybook,
    user: IUser,
    target: string[] | undefined,
    extraVarsForcedValues?: API.ExtraVars,
    mode: SsmAnsible.ExecutionMode = SsmAnsible.ExecutionMode.APPLY,
  ) {
    const substitutedExtraVars: API.ExtraVars | undefined = await this.completeExtraVar(
      playbook,
      target,
      extraVarsForcedValues,
    );
 return await this.ansibleCommandService.executePlaybookFull(
    playbook.path,
    user,
    target,
    substitutedExtraVars,
    mode,
    undefined,
    playbook.playbooksRepository?.vaults as IAnsibleVault[] | undefined,
  );
  }

  async executePlaybookOnInventory(
    playbook: IPlaybook,
    user: IUser,
    inventoryTargets?: Playbooks.All & Playbooks.HostGroups,
    extraVarsForcedValues?: API.ExtraVars,
    execUuid?: string,
  ) {
    const substitutedExtraVars: API.ExtraVars | undefined = await this.completeExtraVar(
      playbook,
      undefined,
      extraVarsForcedValues,
    );
    return await this.ansibleCommandService.executePlaybookOnInventory(
    playbook.path,
    user,
    inventoryTargets,
    substitutedExtraVars,
    undefined,
    undefined,
    execUuid,
    playbook.playbooksRepository?.vaults as IAnsibleVault[] | undefined,
    );
  }


  async addExtraVarToPlaybook(playbook: IPlaybook, extraVar: API.ExtraVar) {
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
      await this.cacheService.set(extraVar.extraVar, extraVar.value || '');
    }
  }

  async deleteExtraVarFromPlaybook(playbook: IPlaybook, extraVarName: string) {
    const removedVar = playbook.extraVars?.filter((e) => {
      return e.extraVar !== extraVarName;
    });

    await this.playbookRepository.updateOrCreate({
      ...playbook,
      extraVars: removedVar,
    });
  }
}