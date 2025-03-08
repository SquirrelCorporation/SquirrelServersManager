import { API, Automations } from 'ssm-shared-lib';
import { IAutomationRepository } from '../../../domain/repositories/automation.repository.interface';
import { IPlaybookRepository } from '../../../../playbooks/domain/repositories/playbook.repository.interface';
import { IPlaybookService } from '../../../../playbooks/application/services/playbook.service.interface';
import { IAnsibleTaskStatusRepository } from '../../../../ansible/domain/repositories/task-status.repository.interface';
import { IUserRepository } from '../../../../users/';
import { AbstractActionComponent } from './abstract-action.component';

export class PlaybookActionComponent extends AbstractActionComponent {
  public readonly playbookUuid: string;
  public readonly targets: string[];
  public readonly extraVarsForcedValues?: API.ExtraVars;
  private playbookRepo: IPlaybookRepository;
  private ansibleTaskStatusRepo: IAnsibleTaskStatusRepository;
  private userRepo: IUserRepository;
  private playbookUseCases: IPlaybookService;

  constructor(
    automationUuid: string,
    automationName: string,
    playbookUuid: string,
    targets: string[],
    extraVarsForcedValues?: API.ExtraVars,
    automationRepository?: IAutomationRepository,
    playbookRepo?: IPlaybookRepository,
    ansibleTaskStatusRepo?: IAnsibleTaskStatusRepository,
    userRepo?: IUserRepository,
    playbookUseCases?: IPlaybookService
  ) {
    super(automationUuid, automationName, Automations.Actions.PLAYBOOK, automationRepository!);
    if (!playbookUuid || !targets || targets.length === 0) {
      throw new Error('Empty parameters');
    }
    this.playbookUuid = playbookUuid;
    this.targets = targets;
    this.extraVarsForcedValues = extraVarsForcedValues;
    this.playbookRepo = playbookRepo!;
    this.ansibleTaskStatusRepo = ansibleTaskStatusRepo!;
    this.userRepo = userRepo!;
    this.playbookUseCases = playbookUseCases!;
  }

  async executeAction(): Promise<void> {
    this.childLogger.info('Playbook Action Component - executeAction - started');

    try {
      // Get the playbook
      const playbook = await this.playbookRepo.findByUuid(this.playbookUuid);
      if (!playbook) {
        throw new Error(`Playbook not found: ${this.playbookUuid}`);
      }

      // Get the admin user for execution
      const adminUser = await this.userRepo.findFirst();
      if (!adminUser) {
        throw new Error('Admin user not found');
      }

      // Execute the playbook
      const execId = await this.playbookUseCases.executePlaybook(
        playbook,
        this.targets,
        adminUser,
        this.extraVarsForcedValues,
      );

      // Wait for the result
      await this.waitForResult(execId);

      await this.onSuccess();
    } catch (error: any) {
      this.childLogger.error(`Failed to execute playbook: ${error.message}`);
      await this.onError(error.message);
    }
  }

  static isFinalStatus = (status: string): boolean => {
    return [
      'SUCCESS',
      'FAILED',
      'ERROR',
      'CANCELED'
    ].includes(status);
  };

  async waitForResult(execId: string, timeoutCount = 0): Promise<void> {
    if (timeoutCount > 60) {
      this.childLogger.error(`Playbook execution timed out after ${timeoutCount} checks`);
      await this.onErrorSafely('Playbook execution timed out');
      return;
    }

    try {
      const taskStatus = await this.ansibleTaskStatusRepo.findByExecId(execId);

      if (!taskStatus) {
        this.childLogger.error(`Task status not found for execId: ${execId}`);
        await this.onErrorSafely('Task status not found');
        return;
      }

      if (PlaybookActionComponent.isFinalStatus(taskStatus.status)) {
        if (taskStatus.status === 'SUCCESS') {
          this.childLogger.info(`Playbook execution successful: ${execId}`);
          await this.onSuccess();
        } else {
          this.childLogger.error(`Playbook execution failed: ${execId}, status: ${taskStatus.status}`);
          await this.onErrorSafely(`Playbook execution failed with status: ${taskStatus.status}`);
        }
        return;
      }

      // Not finished yet, check again after a delay
      setTimeout(() => {
        void this.waitForResult(execId, timeoutCount + 1);
      }, 5000);
    } catch (error: any) {
      this.childLogger.error(`Error checking task status: ${error.message}`);
      await this.onErrorSafely(error.message);
    }
  }

  private async onErrorSafely(message?: string): Promise<void> {
    try {
      await this.onError(message);
    } catch (error: any) {
      this.childLogger.error(`Error in onError handler: ${error.message}`);
    }
  }
}
