// import { AnsibleCommandService, ExtraVarsService, TaskLogsService } from '@modules/ansible';
import {
  DEFAULT_VAULT_ID,
  IAnsibleVault,
  IVaultCryptoService,
  VAULT_CRYPTO_SERVICE,
} from '@modules/ansible-vaults';
import { IPlaybooksService } from '@modules/playbooks/doma../../domain/interfaces/playbooks-service.interface';
import { IPlaybook } from '@modules/playbooks/domain/entities/playbook.entity';
import { IUser } from '@modules/users/domain/entities/user.entity';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { API, SsmAnsible, SsmStatus } from 'ssm-shared-lib';
import { v4 } from 'uuid';
import { PreCheckDeviceConnectionDto } from '@modules/playbooks/presentation/dtos/pre-check-device-connection.dto';
import {
  ANSIBLE_COMMAND_SERVICE,
  EXTRA_VARS_SERVICE,
  IAnsibleCommandService,
  IExtraVarsService,
  IInventoryTransformerService,
  INVENTORY_TRANSFORMER_SERVICE,
  ITaskLogsService,
  TASK_LOGS_SERVICE,
} from '@modules/ansible';
import {
  IPlaybookRepository,
  PLAYBOOK_REPOSITORY,
} from '../../domain/repositories/playbook-repository.interface';
import { Playbooks } from '../../../../types/typings';

/**
 * PlaybookService implements the IPlaybooksService interface
 */
@Injectable()
export class PlaybookService implements IPlaybooksService {
  private readonly logger = new Logger(PlaybookService.name);
  constructor(
    @Inject(PLAYBOOK_REPOSITORY)
    private readonly playbookRepository: IPlaybookRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @Inject(EXTRA_VARS_SERVICE) private readonly extraVarsService: IExtraVarsService,
    @Inject(ANSIBLE_COMMAND_SERVICE)
    private readonly ansibleCommandService: IAnsibleCommandService,
    @Inject(TASK_LOGS_SERVICE) private readonly ansibleTaskService: ITaskLogsService,
    @Inject(INVENTORY_TRANSFORMER_SERVICE)
    private readonly inventoryService: IInventoryTransformerService,
    @Inject(VAULT_CRYPTO_SERVICE)
    private readonly vaultCryptoService: IVaultCryptoService,
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
    this.logger.log(`Executing playbook: ${playbook.name}`);
    this.logger.debug(`Playbook: ${JSON.stringify(playbook)}`);
    this.logger.debug(`User: ${JSON.stringify(user)}`);
    this.logger.debug(`Target: ${JSON.stringify(target)}`);
    this.logger.debug(`ExtraVarsForcedValues: ${JSON.stringify(extraVarsForcedValues)}`);
    this.logger.debug(`Mode: ${JSON.stringify(mode)}`);
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

  async preCheckDeviceConnection(
    preCheckDeviceConnectionDto: PreCheckDeviceConnectionDto,
    user: IUser,
  ) {
    const {
      masterNodeUrl,
      ip,
      authType,
      sshKey,
      sshUser,
      sshPwd,
      sshPort,
      sshConnection,
      becomeMethod,
      becomePass,
      sshKeyPass,
    } = preCheckDeviceConnectionDto;
    if (masterNodeUrl) {
      await this.cacheManager.set(
        SsmAnsible.DefaultSharedExtraVarsList.MASTER_NODE_URL,
        masterNodeUrl,
      );
    }
    const execUuid = v4();
    const mockedInventoryTarget = await this.inventoryService.inventoryBuilderForTarget(
      [
        {
          device: {
            _id: 'tmp',
            ip,
            uuid: 'tmp',
            status: SsmStatus.DeviceStatus.REGISTERING,
            capabilities: { containers: {} },
            systemInformation: {},
            configuration: { containers: {}, systemInformation: {} },
          },
          authType,
          sshKey: sshKey
            ? await this.vaultCryptoService.encrypt(sshKey, DEFAULT_VAULT_ID)
            : undefined,
          sshUser,
          sshPwd: sshPwd
            ? await this.vaultCryptoService.encrypt(sshPwd, DEFAULT_VAULT_ID)
            : undefined,
          sshPort: sshPort || 22,
          becomeMethod,
          sshConnection,
          becomePass: becomePass
            ? await this.vaultCryptoService.encrypt(becomePass, DEFAULT_VAULT_ID)
            : undefined,
          sshKeyPass: sshKeyPass
            ? await this.vaultCryptoService.encrypt(sshKeyPass, DEFAULT_VAULT_ID)
            : undefined,
        },
      ],
      execUuid,
    );
    const playbook =
      await this.playbookRepository.findOneByUniqueQuickReference('checkDeviceBeforeAdd');
    if (!playbook) {
      throw new Error('_checkDeviceBeforeAdd.yml not found.');
    }
    const taskId = await this.executePlaybookOnInventory(playbook, user, mockedInventoryTarget);
    return {
      taskId: taskId,
    };
  }
}
