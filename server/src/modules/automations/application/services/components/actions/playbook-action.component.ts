import { API, Automations, SsmAnsible } from 'ssm-shared-lib';
import { IPlaybooksService } from '@modules/playbooks';
import { ITaskLogsService } from '@modules/ansible';
import { IUserRepository } from '@modules/users';
import { IAutomationRepository } from '../../../../domain/repositories/automation.repository.interface';
import { AbstractActionComponent } from './abstract-action.component';

export class PlaybookActionComponent extends AbstractActionComponent {
  public readonly playbookUuid: string;
  public readonly targets: string[];
  public readonly extraVarsForcedValues?: API.ExtraVars;
  private taskLogsService: ITaskLogsService;
  private userRepo: IUserRepository;
  private playbookUseCases: IPlaybooksService;

  constructor(
    automationUuid: string,
    automationName: string,
    playbookUuid: string,
    targets: string[],
    extraVarsForcedValues?: API.ExtraVars,
    automationRepository?: IAutomationRepository,
    taskLogsService?: ITaskLogsService,
    userRepo?: IUserRepository,
    playbookUseCases?: IPlaybooksService,
  ) {
    super(automationUuid, automationName, Automations.Actions.PLAYBOOK, automationRepository!);
    if (!playbookUuid || !targets || targets.length === 0) {
      throw new Error('Empty parameters');
    }
    this.playbookUuid = playbookUuid;
    this.targets = targets;
    this.extraVarsForcedValues = extraVarsForcedValues;
    this.taskLogsService = taskLogsService!;
    this.userRepo = userRepo!;
    this.playbookUseCases = playbookUseCases!;
  }

  async executeAction(): Promise<void> {
    this.childLogger.info('Playbook Action Component - executeAction - started');

    try {
      // Get the playbook
      const playbook = await this.playbookUseCases.getPlaybookByUuid(this.playbookUuid);
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
        adminUser,
        this.targets,
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
    return ['SUCCESS', 'FAILED', 'ERROR', 'CANCELED'].includes(status);
  };

  async waitForResult(execId: string, timeoutCount = 0): Promise<void> {
    if (timeoutCount > 60) {
      this.childLogger.error(`Playbook execution timed out after ${timeoutCount} checks`);
      await this.onErrorSafely('Playbook execution timed out');
      return;
    }

    try {
      const execStatuses = await this.taskLogsService.getTaskStatuses(execId);

      if (!execStatuses || execStatuses.length === 0) {
        this.childLogger.warn(
          `Playbook Action Component - No execution statuses found (yet) for execId: ${execId}`,
        );
        setTimeout(() => {
          this.waitForResult(execId, timeoutCount + 1);
        }, 5000);
      } else {
        const lastExecStatus = execStatuses[0];
        this.childLogger.debug(
          `Playbook Action Component - Latest execution status ${lastExecStatus.status}`,
        );
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
