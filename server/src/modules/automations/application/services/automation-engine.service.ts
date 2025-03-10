import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutomationComponent } from '../../domain/components/automation.component';
import { Automation } from '../../domain/entities/automation.entity';
import { IAutomationRepository } from '../../domain/repositories/automation.repository.interface';
import { IContainerRepository } from '../../containers/domain/repositories/container.repository.interface';
import { IContainerService } from '../../../containers/application/services/container.service.interface';
import { IVolumeRepository } from '../../../containers/domain/repositories/volume.repository.interface';
import { IVolumeService } from '../../../containers/application/services/volume.service.interface';
import { IPlaybookRepository } from '../../../playbooks/domain/repositories/playbook.repository.interface';
import { IPlaybookService } from '../../../playbooks/application/services/playbook.service.interface';
import { IAnsibleTaskStatusRepository } from '../../../ansible/';
import { IUserRepository } from '../../../users/';
import { AutomationDocument } from '../../infrastructure/schemas/automation.schema';

@Injectable()
export class AutomationEngine implements OnModuleInit {
  private readonly logger = new Logger(AutomationEngine.name);
  private components: Map<string, AutomationComponent> = new Map();

  constructor(
    @InjectModel(Automation.name) private automationModel: Model<AutomationDocument>,
    private automationRepository: IAutomationRepository,

    // Container module dependencies
    @Inject('CONTAINERS_MODULE.ContainerRepository') private containerRepo: IContainerRepository,
    @Inject('CONTAINERS_MODULE.ContainerService') private containerUseCases: IContainerService,
    @Inject('CONTAINERS_MODULE.VolumeRepository') private containerVolumeRepo: IVolumeRepository,
    @Inject('CONTAINERS_MODULE.VolumeService') private containerVolumeUseCases: IVolumeService,

    // Playbooks module dependencies
    @Inject('PLAYBOOKS_MODULE.PlaybookRepository') private playbookRepo: IPlaybookRepository,
    @Inject('PLAYBOOKS_MODULE.PlaybookService') private playbookUseCases: IPlaybookService,

    // Ansible module dependencies
    @Inject('ANSIBLE_MODULE.TaskStatusRepository') private ansibleTaskStatusRepo: IAnsibleTaskStatusRepository,

    // Users module dependencies
    @Inject('USERS_MODULE.UserRepository') private userRepo: IUserRepository
  ) {}

  /**
   * Initialize the automation engine when the module is loaded
   */
  async onModuleInit() {
    this.logger.log('Initializing AutomationEngine...');
    await this.registerComponents();
    this.logger.log(
      `AutomationEngine initialized with ${this.components.size} automations`,
    );
  }

  /**
   * Get the current state of all registered automations
   */
  getStates() {
    return { automation: this.components };
  }

  /**
   * Register a single automation component
   * @param automationToRegister The automation to register
   */
  async registerComponent(automationToRegister: Automation) {
    this.logger.log(
      `Registering automation: ${automationToRegister.name} (${automationToRegister.uuid})`,
    );

    try {
      // Validate the automation data before creating the component
      if (!automationToRegister.uuid || !automationToRegister.name) {
        throw new Error('Invalid automation data: missing uuid or name');
      }

      if (!automationToRegister.automationChains) {
        throw new Error('Invalid automation data: missing automationChains');
      }

      // Create the automation component
      this.components.set(automationToRegister.uuid, new AutomationComponent(
        automationToRegister.uuid,
        automationToRegister.name,
        automationToRegister.automationChains,
        this.automationRepository,
        this.containerRepo,
        this.containerUseCases,
        this.containerVolumeRepo,
        this.containerVolumeUseCases,
        this.playbookRepo,
        this.ansibleTaskStatusRepo,
        this.userRepo,
        this.playbookUseCases
      ));

      // Initialize the component
      try {
        const component = this.components.get(automationToRegister.uuid);
        if (!component) {
          throw new Error(`Component not found after registration: ${automationToRegister.uuid}`);
        }
        await component.init();
        this.logger.log(`Successfully registered automation: ${automationToRegister.name}`);
      } catch (initError: any) {
        // If initialization fails, clean up the component and rethrow
        this.components.delete(automationToRegister.uuid);
        this.logger.error(
          `Failed to initialize automation ${automationToRegister.name}: ${initError.message}`,
          initError.stack,
        );
        throw initError;
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to register automation ${automationToRegister.name}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Registers all enabled automations from the database
   */
  private async registerComponents(): Promise<void> {
    try {
      const enabledAutomations = await this.automationRepository.findAllEnabled();
      this.logger.log(`Found ${enabledAutomations.length} enabled automations`);

      for (const automation of enabledAutomations) {
        try {
          await this.registerComponent(automation);
        } catch (error: any) {
          this.logger.error(
            `Failed to register automation ${automation.name}: ${error.message}`,
            error.stack,
          );
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to load automations: ${error.message}`, error.stack);
    }
  }

  /**
   * Deregister an automation component
   * @param automation The automation to deregister
   */
  async deregisterComponent(automation: Automation) {
    this.logger.log(`Deregistering automation: ${automation.name} (${automation.uuid})`);

    const registeredAutomationComponent = this.components.get(automation.uuid);

    if (!registeredAutomationComponent) {
      this.logger.warn(`Automation component not found for deregistration: ${automation.uuid}`);
      return;
    }

    try {
      registeredAutomationComponent.deregister();
      this.components.delete(automation.uuid);
      this.logger.log(`Successfully deregistered automation: ${automation.name}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to deregister automation ${automation.name}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Execute an automation manually
   * @param automation The automation to execute
   */
  async executeAutomation(automation: Automation) {
    this.logger.log(`Executing automation: ${automation.name} (${automation.uuid})`);

    const registeredAutomationComponent = this.components.get(automation.uuid);

    if (!registeredAutomationComponent) {
      throw new Error(`Automation component not found: ${automation.uuid}`);
    }

    try {
      await registeredAutomationComponent.synchronousExecution();
      this.logger.log(`Successfully executed automation: ${automation.name}`);
    } catch (error: any) {
      this.logger.error(
        `Failed to execute automation ${automation.name}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
