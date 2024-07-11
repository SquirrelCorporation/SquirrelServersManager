import pino from 'pino';
import { Automations } from 'ssm-shared-lib';
import AutomationRepo from '../../../data/database/repository/AutomationRepo';
import logger from '../../../logger';

abstract class AbstractActionComponent {
  public type: Automations.Actions;
  public childLogger: pino.Logger<never>;
  public readonly automationUuid: string;

  protected constructor(automationUuid: string, automationName: string, type: Automations.Actions) {
    this.type = type;
    this.automationUuid = automationUuid;
    this.childLogger = logger.child(
      { module: `ActionComponent/${automationUuid}/${automationName}`, type: type },
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

  async onError() {
    const automation = await AutomationRepo.findByUuid(this.automationUuid);
    if (!automation) {
      throw new Error(`Automation with uuid ${this.automationUuid} not found`);
    }
    await AutomationRepo.setLastExecutionStatus(automation, 'failed');
  }
}

export default AbstractActionComponent;
