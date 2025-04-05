import { AnsibleCommandService, ExtraVarsService, TaskLogsService } from '@modules/ansible';
import { IAnsibleVault } from '@modules/ansible-vaults';
import { IPlaybooksService } from '@modules/playbooks/doma../../domain/interfaces/playbooks-service.interface';
import { IPlaybook } from '@modules/playbooks/domain/entities/playbook.entity';
import { IShellWrapperService, SHELL_WRAPPER_SERVICE } from '@modules/shell';
import { IUser } from '@modules/users/domain/entities/user.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Playbooks } from 'src/types/typings';
import { API, SsmAnsible } from 'ssm-shared-lib';
import { IPlaybookRepository, PLAYBOOK_REPOSITORY } from '../../domain/repositories/playbook-repository.interface';

/**
 * PlaybookService implements the IPlaybooksService interface
 */
@Injectable()
export class PlaybookService implements IPlaybooksService {
  constructor(
    @Inject(PLAYBOOK_REPOSITORY)
    private readonly playbookRepository: IPlaybookRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(SHELL_WRAPPER_SERVICE) private readonly shellWrapperService: IShellWrapperService,
    private readonly extraVarsService: ExtraVarsService,
    private readonly ansibleCommandService: AnsibleCommandService,
    private readonly ansibleTaskService: TaskLogsService,
  ) {}

  async getPlaybookByUuid(uuid: string): Promise<IPlaybook | null> {
    return this.playbookRepository.findOneByUuid(uuid);
  }

  async getPlaybookByQuickReference(quickReference: string): Promise<IPlaybook | null> {
    return this.playbookRepository.findOneByUniqueQuickReference(quickReference);
  }

  async findOneByUniqueQuickReference(quickRef: string): Promise<IPlaybook | null> {
    return this.playbookRepository.findOneByUniqueQuickReference(quickRef);
  }

  async findOneByName(name: string): Promise<IPlaybook | null> {
    return this.playbookRepository.findOneByName(name);
  }

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
    if (playbook.extraVars?.some((e) => e.extraVar === extraVar.extraVar)) {
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
      await this.cacheManager.set(extraVar.extraVar, extraVar.value || '');
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

  async getExecLogs(execId: string) {
    return this.ansibleTaskService.getTaskLogs(execId);
  }

  async getExecStatus(execId: string) {
    return this.ansibleTaskService.getTaskStatuses(execId);
  }
}
