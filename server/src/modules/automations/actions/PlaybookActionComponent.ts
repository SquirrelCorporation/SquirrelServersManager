import { API, Automations, SsmAnsible } from 'ssm-shared-lib';
import User from '../../../data/database/model/User';
import AnsibleTaskStatusRepo from '../../../data/database/repository/AnsibleTaskStatusRepo';
import PlaybookRepo from '../../../data/database/repository/PlaybookRepo';
import UserRepo from '../../../data/database/repository/UserRepo';
import PlaybookUseCases from '../../../services/PlaybookUseCases';
import AbstractActionComponent from './AbstractActionComponent';

class PlaybookActionComponent extends AbstractActionComponent {
  public playbookUuid: string;
  public targets: string[];
  public extraVarsForcedValues?: API.ExtraVars;

  constructor(
    automationUuid: string,
    automationName: string,
    playbookUuid: string,
    targets: string[],
    extraVarsForcedValues?: API.ExtraVars,
  ) {
    super(automationUuid, automationName, Automations.Actions.PLAYBOOK);
    if (!playbookUuid || !targets) {
      throw new Error('Empty parameters');
    }
    this.playbookUuid = playbookUuid;
    this.targets = targets;
    this.extraVarsForcedValues = extraVarsForcedValues;
  }

  async executeAction() {
    this.childLogger.info('Playbook Action Component execute - started');
    const user = (await UserRepo.findFirst()) as User;
    const playbook = await PlaybookRepo.findOneByUuid(this.playbookUuid);
    if (!playbook) {
      this.childLogger.error(`Playbook ${this.playbookUuid} does not exist`);
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
      await this.onError();
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

  async waitForResult(execId: string, timeoutCount = 0) {
    this.childLogger.info(`wait for result ${execId} - (try: ${timeoutCount}/100)`);
    try {
      if (timeoutCount > 100) {
        this.childLogger.error('Timeout reached for task');
        await this.onError();
        return;
      }
      const execStatuses = await AnsibleTaskStatusRepo.findAllByIdent(execId);
      if (!execStatuses || execStatuses.length === 0) {
        this.childLogger.warn(`No execution statuses found (yet) for execId: ${execId}`);
        setTimeout(() => {
          this.waitForResult(execId, timeoutCount + 1);
        }, 5000);
      } else {
        const lastExecStatus = execStatuses[0];
        this.childLogger.info(`Latest execution status ${lastExecStatus.status}`);
        if (PlaybookActionComponent.isFinalStatus(lastExecStatus.status as string)) {
          if (lastExecStatus.status === SsmAnsible.AnsibleTaskStatus.SUCCESS) {
            await this.onSuccess();
          } else {
            await this.onError();
          }
        } else {
          setTimeout(() => {
            this.waitForResult(execId, timeoutCount + 1);
          }, 5000);
        }
      }
    } catch (error: any) {
      this.childLogger.error(error);
      await this.onErrorSafely(); // Use a safe method to handle errors
      return;
    }
  }

  private async onErrorSafely() {
    try {
      await this.onError();
    } catch (innerError) {
      this.childLogger.error('Error during onError handling:', innerError);
    }
  }
}

export default PlaybookActionComponent;
