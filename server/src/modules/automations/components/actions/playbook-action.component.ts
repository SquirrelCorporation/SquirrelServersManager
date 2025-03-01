import { API, Automations, SsmAnsible } from 'ssm-shared-lib';
import User from '../../../../data/database/model/User';
import AnsibleTaskStatusRepo from '../../../../data/database/repository/AnsibleTaskStatusRepo';
import PlaybookRepo from '../../../../data/database/repository/PlaybookRepo';
import UserRepo from '../../../../data/database/repository/UserRepo';
import logger from '../../../../logger';
import PlaybookUseCases from '../../../../services/PlaybookUseCases';
import { AbstractActionComponent } from './abstract-action.component';

export class PlaybookActionComponent extends AbstractActionComponent {
  public readonly playbookUuid: string;
  public readonly targets: string[];
  public readonly extraVarsForcedValues?: API.ExtraVars;

  constructor(
    automationUuid: string,
    automationName: string,
    playbookUuid: string,
    targets: string[],
    extraVarsForcedValues?: API.ExtraVars,
  ) {
    super(automationUuid, automationName, Automations.Actions.PLAYBOOK);
    if (!playbookUuid || !targets || targets.length === 0) {
      throw new Error('Empty parameters');
    }
    this.playbookUuid = playbookUuid;
    this.targets = targets;
    this.extraVarsForcedValues = extraVarsForcedValues;

    // Initialize the child logger
    this.childLogger = logger.child(
      {
        module: 'AutomationAction',
        moduleId: `${automationUuid}`,
        moduleName: `${automationName}`,
        type: 'Playbook',
      },
      { msgPrefix: '[AUTOMATION_ACTION] - ' },
    );
  }

  async executeAction(): Promise<void> {
    this.childLogger.info('Playbook Action Component - executeAction - started');
    const user = (await UserRepo.findFirst()) as User;
    const playbook = await PlaybookRepo.findOneByUuid(this.playbookUuid);

    if (!playbook) {
      this.childLogger.error(
        `Playbook Action Component - Playbook ${this.playbookUuid} does not exist`,
      );
      await this.onError(`Playbook ${this.playbookUuid} does not exist`);
      return;
    }

    try {
      const execId = await PlaybookUseCases.executePlaybook(
        playbook,
        user,
        this.targets,
        this.extraVarsForcedValues,
      );
      void this.waitForResult(execId);
    } catch (error: any) {
      this.childLogger.error(error);
      await this.onError(error.message);
      return;
    }
  }

  static isFinalStatus = (status: string): boolean => {
    return (
      status === SsmAnsible.AnsibleTaskStatus.FAILED ||
      status === SsmAnsible.AnsibleTaskStatus.SUCCESS ||
      status === SsmAnsible.AnsibleTaskStatus.CANCELED ||
      status === SsmAnsible.AnsibleTaskStatus.TIMEOUT
    );
  };

  async waitForResult(execId: string, timeoutCount = 0): Promise<void> {
    this.childLogger.info(
      `Playbook Action Component - wait for result ${execId} - (try: ${timeoutCount}/100)`,
    );

    try {
      if (timeoutCount > 100) {
        this.childLogger.error('Timeout reached for task');
        await this.onError('Timeout reached for task');
        return;
      }

      const execStatuses = await AnsibleTaskStatusRepo.findAllByIdent(execId);

      if (!execStatuses || execStatuses.length === 0) {
        this.childLogger.warn(
          `Playbook Action Component - No execution statuses found (yet) for execId: ${execId}`,
        );
        setTimeout(() => {
          void this.waitForResult(execId, timeoutCount + 1);
        }, 5000);
      } else {
        const lastExecStatus = execStatuses[0];
        this.childLogger.info(
          `Playbook Action Component - Latest execution status ${lastExecStatus.status}`,
        );

        if (PlaybookActionComponent.isFinalStatus(lastExecStatus.status as string)) {
          if (lastExecStatus.status === SsmAnsible.AnsibleTaskStatus.SUCCESS) {
            await this.onSuccess();
          } else {
            await this.onError(`Playbook execution failed with status: ${lastExecStatus.status}`);
          }
        } else {
          setTimeout(() => {
            void this.waitForResult(execId, timeoutCount + 1);
          }, 5000);
        }
      }
    } catch (error: any) {
      this.childLogger.error(error);
      await this.onErrorSafely(error.message);
      return;
    }
  }

  private async onErrorSafely(message?: string): Promise<void> {
    try {
      await this.onError(message);
    } catch (innerError) {
      this.childLogger.error(
        'Playbook Action Component - Error during onError handling:',
        innerError,
      );
    }
  }
}
