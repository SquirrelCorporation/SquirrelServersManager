import pino from 'pino';
import { Automations } from 'ssm-shared-lib';
import AutomationRepo from '../../../data/database/repository/AutomationRepo';
import EventManager from '../../../helpers/events/EventManager';
import Events from '../../../helpers/events/events';
import logger from '../../../logger';

abstract class AbstractActionComponent extends EventManager {
  public type: Automations.Actions;
  public childLogger: pino.Logger<never>;
  public readonly automationUuid: string;
  private readonly module = 'AutomationAction';
  private readonly moduleName: string;

  protected constructor(automationUuid: string, automationName: string, type: Automations.Actions) {
    super();
    this.type = type;
    this.automationUuid = automationUuid;
    this.moduleName = automationName;
    this.childLogger = logger.child(
      {
        module: `${this.module}`,
        moduleId: `${automationUuid}`,
        moduleName: `${automationName}`,
        type: type,
      },
      { msgPrefix: '[ACTION-COMPONENT] - ' },
    );
  }

  async executeAction() {}

  async onSuccess() {
    const automation = await AutomationRepo.findByUuid(this.automationUuid);
    if (!automation) {
      throw new Error(`Automation with uuid ${this.automationUuid} not found`);
    }
    await AutomationRepo.setLastExecutionStatus(automation, 'success');
  }

  async onError(optionalMessage?: string) {
    const automation = await AutomationRepo.findByUuid(this.automationUuid);
    if (!automation) {
      throw new Error(`Automation with uuid ${this.automationUuid} not found`);
    }
    await AutomationRepo.setLastExecutionStatus(automation, 'failed');
    this.childLogger.error('Automation failed');
    this.emit(Events.AUTOMATION_FAILED, {
      message: optionalMessage || `The automation "${this.moduleName}" failed`,
      severity: 'error',
      module: this.module,
      moduleId: this.automationUuid,
    });
  }
}

export default AbstractActionComponent;
