import { API, Automations } from 'ssm-shared-lib';
import User from '../../../data/database/model/User';
import AnsibleTaskStatusRepo from '../../../data/database/repository/AnsibleTaskStatusRepo';
import PlaybookRepo from '../../../data/database/repository/PlaybookRepo';
import UserRepo from '../../../data/database/repository/UserRepo';
import PlaybookUseCases from '../../../use-cases/PlaybookUseCases';
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
      setTimeout(() => {
        void this.waitForResult(execId);
      }, 10000);
    } catch (error: any) {
      this.childLogger.error(error);
      await this.onError();
      return;
    }
  }

  static isFinalStatus = (status: string): boolean => {
    return status === 'failed' || status === 'successful';
  };

  async waitForResult(execId: string, timeoutCount = 0) {
    try {
      if (timeoutCount > 100) {
        this.childLogger.error('Timeout reached for task');
        await this.onError();
        return;
      }
      const execStatuses = await AnsibleTaskStatusRepo.findAllByIdent(execId);
      if (!execStatuses || execStatuses.length === 0) {
        setTimeout(() => {
          this.waitForResult(execId, timeoutCount + 1);
        }, 5000);
        return;
      }
      const lastExecStatus = execStatuses[execStatuses.length - 1];
      if (PlaybookActionComponent.isFinalStatus(lastExecStatus.status as string)) {
        if (lastExecStatus.status === 'successful') {
          await this.onSuccess();
        } else {
          await this.onError();
        }
      } else {
        setTimeout(() => {
          this.waitForResult(execId, timeoutCount + 1);
        }, 5000);
      }
    } catch (error: any) {
      this.childLogger.error(error);
      await this.onError();
      return;
    }
  }
}

export default PlaybookActionComponent;
