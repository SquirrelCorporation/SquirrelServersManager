import { EventEmitter } from 'events';
import pino from 'pino';
import { Automations } from 'ssm-shared-lib';
import { IAutomationRepository } from '../../../domain/repositories/automation.repository.interface';
import logger from '../../../../../logger';
import Events from '../../../../../core/events/events';

export abstract class AbstractActionComponent extends EventEmitter {
  public type: Automations.Actions;
  public childLogger: pino.Logger<never>;
  public readonly automationUuid: string;
  private readonly module = 'AutomationAction';
  private readonly moduleName: string;
  protected automationRepository: IAutomationRepository;

  constructor(
    automationUuid: string,
    automationName: string,
    type: Automations.Actions,
    automationRepository: IAutomationRepository,
  ) {
    super();
    this.type = type;
    this.automationUuid = automationUuid;
    this.moduleName = automationName;
    this.automationRepository = automationRepository;
    this.childLogger = logger.child(
      {
        module: `${this.module}`,
        moduleId: `${automationUuid}`,
        moduleName: `${automationName}`,
        type: type,
      },
      { msgPrefix: '[AUTOMATION_ACTION] - ' },
    );
  }

  abstract executeAction(): Promise<void>;

  async onSuccess(): Promise<void> {
    const automation = await this.automationRepository.findByUuid(this.automationUuid);
    if (!automation) {
      throw new Error(`Automation with uuid ${this.automationUuid} not found`);
    }
    await this.automationRepository.setLastExecutionStatus(this.automationUuid, 'success');
  }

  async onError(optionalMessage?: string): Promise<void> {
    const automation = await this.automationRepository.findByUuid(this.automationUuid);
    if (!automation) {
      throw new Error(`Automation with uuid ${this.automationUuid} not found`);
    }
    await this.automationRepository.setLastExecutionStatus(this.automationUuid, 'failed');
    this.childLogger.error(`Automation failed - error: ${optionalMessage || 'Unknown reason'}`);
    this.emit(Events.AUTOMATION_FAILED, {
      message: optionalMessage || `The automation "${this.moduleName}" failed`,
      severity: 'error',
      module: this.module,
      moduleId: this.automationUuid,
    });
  }
}
