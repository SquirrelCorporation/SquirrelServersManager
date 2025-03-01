import pino from 'pino';
import { Automations } from 'ssm-shared-lib';
import logger from '../../../logger';
import { AbstractActionComponent } from './actions/abstract-action.component';
import { DockerActionComponent } from './actions/docker-action.component';
import { DockerVolumeActionComponent } from './actions/docker-volume-action.component';
import { PlaybookActionComponent } from './actions/playbook-action.component';
import { AbstractTriggerComponent } from './triggers/abstract-trigger.component';
import { CronTriggerComponent } from './triggers/cron-trigger.component';

export class AutomationComponent {
  public uuid: string;
  public name: string;
  public trigger?: AbstractTriggerComponent;
  public actions: AbstractActionComponent[];
  public childLogger: pino.Logger<never>;
  public automationChain: Automations.AutomationChain;

  constructor(uuid: string, name: string, automationChain: any) {
    this.uuid = uuid;
    this.name = name;
    this.childLogger = logger.child(
      {
        module: `Automation`,
        moduleId: `${this.uuid}`,
        moduleName: `${name}`,
      },
      { msgPrefix: '[AUTOMATION] - ' },
    );
    this.automationChain = automationChain;
    this.actions = [];
  }

  async init() {
    try {
      // Initialize trigger based on the automation chain
      if (this.automationChain && this.automationChain.trigger) {
        switch (this.automationChain.trigger) {
          case Automations.Triggers.CRON:
            if (!this.automationChain.cronValue) {
              this.childLogger.error('Missing cronValue in automation chain');
              throw new Error('Missing cronValue in automation chain');
            }
            this.trigger = new CronTriggerComponent(this.automationChain.cronValue, this);
            break;
          default:
            throw new Error(`Unknown trigger type ${this.automationChain.trigger}`);
        }
      } else {
        this.childLogger.error('Invalid automation chain structure: missing trigger');
        throw new Error('Invalid automation chain structure: missing trigger');
      }

      // Initialize actions based on the automation chain
      if (this.automationChain && Array.isArray(this.automationChain.actions)) {
        const actionsChain = this.automationChain.actions;
        this.actions = actionsChain.map((actionChain) => {
          if (!actionChain || !actionChain.action) {
            this.childLogger.error('Invalid action in automation chain');
            throw new Error('Invalid action in automation chain');
          }

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
                actionChain.extraVarsForcedValues,
              );
            case Automations.Actions.DOCKER_VOLUME:
              return new DockerVolumeActionComponent(
                this.uuid,
                this.name,
                actionChain.dockerVolumeAction,
                actionChain.dockerVolumes,
              );
            default:
              throw new Error(`Unknown action type`);
          }
        });
      } else {
        this.childLogger.error(
          'Invalid automation chain structure: missing or invalid actions array',
        );
        throw new Error('Invalid automation chain structure: missing or invalid actions array');
      }

      this.childLogger.info(
        `Initialized automation "${this.name}" with ${this.actions.length} actions`,
      );
    } catch (error: any) {
      this.childLogger.error(`Failed to initialize automation "${this.name}": ${error.message}`);
      throw error;
    }
  }

  async onTrigger() {
    this.childLogger.info(`Automation "${this.name}" triggered...`);
    await this.synchronousExecution();
  }

  async synchronousExecution() {
    if (this.actions && this.actions.length > 0) {
      for (const action of this.actions) {
        this.childLogger.info(`Executing a ${action.type} action...`);
        try {
          await action.executeAction();
        } catch (error: any) {
          this.childLogger.error(`Error executing action: ${error.message}`);
        }
      }
      this.childLogger.info(`Automation "${this.name}" execution completed`);
    } else {
      this.childLogger.error('No actions found');
    }
  }

  deregister() {
    this.childLogger.info(`Deregistering automation "${this.name}"`);

    // Deregister trigger
    if (this.trigger) {
      this.trigger.deregister();
      this.trigger = undefined;
    }

    // Clear actions
    this.actions = [];

    this.childLogger.info(`Automation "${this.name}" deregistered`);
  }
}
