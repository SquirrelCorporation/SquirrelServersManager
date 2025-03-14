import { Logger } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { Automations } from 'ssm-shared-lib';
import pino from 'pino';
import { IAnsibleTaskStatusRepository } from '@modules/ansible';
import { IContainerRepository } from '../../../containers/domain/repositories/container.repository.interface';
import { IContainerService } from '../../../containers/application/services/container.service.interface';
import { IVolumeRepository } from '../../../containers/domain/repositories/volume.repository.interface';
import { IVolumeService } from '../../../containers/application/services/volume.service.interface';
import { IPlaybookRepository } from '../../../playbooks/domain/repositories/playbook.repository.interface';
import { IPlaybookService } from '../../../playbooks/application/services/playbook.service.interface';
import { IUserRepository } from '../../../users';
import logger from '../../../../logger';
import { IAutomationRepository } from '../../domain/repositories/automation.repository.interface';
import { AbstractActionComponent } from './actions/abstract-action.component';
import { DockerActionComponent } from './actions/docker-action.component';
import { DockerVolumeActionComponent } from './actions/docker-volume-action.component';
import { PlaybookActionComponent } from './actions/playbook-action.component';
import { AbstractTriggerComponent } from './triggers/abstract-trigger.component';
import { CronTriggerComponent } from './triggers/cron-trigger.component';

export class AutomationComponent {
  public uuid: string;
  public name: string;
  public automationChain: any;
  public childLogger: pino.Logger<never>;
  public trigger: AbstractTriggerComponent | undefined;
  public actions: AbstractActionComponent[] = [];
  private readonly module = 'Automation';

  constructor(
    uuid: string,
    name: string,
    automationChain: any,
    private readonly automationRepository: IAutomationRepository,
    private readonly containerRepo?: IContainerRepository,
    private readonly containerUseCases?: IContainerService,
    private readonly containerVolumeRepo?: IVolumeRepository,
    private readonly containerVolumeUseCases?: IVolumeService,
    private readonly playbookRepo?: IPlaybookRepository,
    private readonly ansibleTaskStatusRepo?: IAnsibleTaskStatusRepository,
    private readonly userRepo?: IUserRepository,
    private readonly playbookUseCases?: IPlaybookService,
    private readonly schedulerRegistry?: SchedulerRegistry
  ) {
    this.uuid = uuid;
    this.name = name;
    this.automationChain = automationChain;
    this.childLogger = logger.child(
      {
        module: `${this.module}`,
        moduleId: `${uuid}`,
        moduleName: `${name}`,
      },
      { msgPrefix: '[AUTOMATION] - ' },
    );
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
            if (!this.schedulerRegistry) {
              this.childLogger.error('Missing schedulerRegistry in automation component');
              throw new Error('Missing schedulerRegistry in automation component');
            }
            this.trigger = new CronTriggerComponent(
              this.automationChain.cronValue,
              this,
              this.schedulerRegistry
            );
            break;
          default:
            throw new Error(`Unknown trigger type ${this.automationChain.trigger}`);
        }
      } else {
        this.childLogger.error('Invalid automation chain structure: missing trigger');
        throw new Error('Invalid automation chain structure: missing trigger');
      }

      // Initialize actions based on the automation chain
      if (!this.automationChain.actions || !Array.isArray(this.automationChain.actions)) {
        this.childLogger.error('Invalid automation chain structure: missing actions array');
        throw new Error('Invalid automation chain structure: missing actions array');
      }

      // Process each action in the chain
      for (const actionConfig of this.automationChain.actions) {
        if (!actionConfig || !actionConfig.action) {
          this.childLogger.error('Invalid action in automation chain');
          throw new Error('Invalid action in automation chain');
        }

        let actionComponent: AbstractActionComponent;

        switch (actionConfig.action) {
          case Automations.Actions.DOCKER:
            if (!this.containerRepo || !this.containerUseCases) {
              throw new Error('Container dependencies not provided for Docker action');
            }
            actionComponent = new DockerActionComponent(
              this.uuid,
              this.name,
              actionConfig.dockerAction,
              actionConfig.dockerContainers,
              this.automationRepository,
              this.containerRepo,
              this.containerUseCases,
            );
            break;

          case Automations.Actions.DOCKER_VOLUME:
            if (!this.containerVolumeRepo || !this.containerVolumeUseCases) {
              throw new Error('Container volume dependencies not provided for Docker volume action');
            }
            actionComponent = new DockerVolumeActionComponent(
              this.uuid,
              this.name,
              actionConfig.volumeAction,
              actionConfig.volumeNames,
              this.automationRepository,
              this.containerVolumeRepo,
              this.containerVolumeUseCases,
            );
            break;

          case Automations.Actions.PLAYBOOK:
            if (!this.playbookRepo || !this.ansibleTaskStatusRepo || !this.userRepo || !this.playbookUseCases) {
              throw new Error('Playbook dependencies not provided for Playbook action');
            }
            actionComponent = new PlaybookActionComponent(
              this.uuid,
              this.name,
              actionConfig.playbookId,
              actionConfig.playbookName,
              actionConfig.playbookPath,
              this.automationRepository,
              this.playbookRepo,
              this.ansibleTaskStatusRepo,
              this.userRepo,
              this.playbookUseCases,
            );
            break;

          default:
            throw new Error('Unknown action type');
        }

        this.actions.push(actionComponent);
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
