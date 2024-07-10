import pino from 'pino';
import { Automations } from 'ssm-shared-lib';
import logger from '../../logger';
import AbstractActionComponent from './actions/AbstractActionComponent';
import DockerActionComponent from './actions/DockerActionComponent';
import PlaybookActionComponent from './actions/PlaybookActionComponent';
import TriggerComponent from './triggers/AbstractTriggerComponent';
import CronTriggerComponent from './triggers/CronTriggerComponent';

class AutomationComponent {
  public uuid: string;
  public name: string;
  public trigger: TriggerComponent | undefined;
  public actions: AbstractActionComponent[] | undefined;
  public childLogger: pino.Logger<never>;
  public automationChain: Automations.AutomationChain;

  constructor(uuid: string, name: string, automationChain: any) {
    this.uuid = uuid;
    this.name = name;
    this.childLogger = logger.child(
      {
        module: `AutomationComponent/${this.uuid}/${name}`,
      },
      { msgPrefix: '[AUTOMATION-COMPONENT] - ' },
    );
    this.automationChain = automationChain;
    this.actions = [];
  }

  async init() {
    switch (this.automationChain.trigger) {
      case Automations.Triggers.CRON:
        this.trigger = new CronTriggerComponent(this.automationChain.cronValue, this);
        break;
      default:
        throw new Error('Unknown trigger type');
    }
    const actionsChain = this.automationChain.actions;
    this.actions = actionsChain.map((actionChain) => {
      switch (actionChain.action) {
        case Automations.Actions.DOCKER:
          return new DockerActionComponent(
            this.uuid,
            this.name,
            actionChain.dockerAction,
            actionChain.dockerContainers,
          );
        case Automations.Actions.PLAYBOOK:
          return new PlaybookActionComponent(
            this.uuid,
            this.name,
            actionChain.playbook,
            actionChain.actionDevices,
          );
        default:
          throw new Error('Unknown action type');
      }
    });
  }

  async onTrigger() {
    this.childLogger.info('Triggered');
    await this.synchronousExecution();
  }

  async synchronousExecution() {
    if (this.actions) {
      for (const action of this.actions) {
        this.childLogger.info(`Execution a ${action.type} action`);
        await action.executeAction();
      }
    } else {
      this.childLogger.error('No actions found');
    }
  }

  deregister() {
    this.trigger?.deregister();
    delete this.trigger;
    if (this.actions) {
      for (const i in this.actions) {
        delete this.actions[i];
      }
    } else {
      this.childLogger.error('No actions found');
    }
  }
}

export default AutomationComponent;
