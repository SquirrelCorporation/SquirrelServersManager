import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import {
  CONTAINER_SERVICE,
  CONTAINER_VOLUMES_SERVICE,
  IContainerService,
  IContainerVolumesService,
} from '@modules/containers';
import { IPlaybooksService, PLAYBOOKS_SERVICE } from '@modules/playbooks';
import { ANSIBLE_TASK_STATUS_REPOSITORY, IAnsibleTaskStatusRepository } from '@modules/ansible';
import { IUserRepository, USER_REPOSITORY } from '@modules/users';
import { AutomationComponent } from '../components/automation.component';
import { Automation } from '../../../domain/entities/automation.entity';
import {
  AUTOMATION_REPOSITORY,
  IAutomationRepository,
} from '../../../domain/repositories/automation.repository.interface';

@Injectable()
export class AutomationEngine implements OnModuleInit {
  private readonly logger = new Logger(AutomationEngine.name);
  private components: Map<string, AutomationComponent> = new Map();

  constructor(
    @Inject(AUTOMATION_REPOSITORY)
    private automationRepository: IAutomationRepository,

    // Container module dependencies
    @Inject(CONTAINER_SERVICE)
    private containerUseCases: IContainerService,
    @Inject(CONTAINER_VOLUMES_SERVICE)
    private containerVolumeUseCases: IContainerVolumesService,

    // Playbooks module dependencies
    @Inject(PLAYBOOKS_SERVICE)
    private playbookUseCases: IPlaybooksService,

    // Ansible module dependencies
    @Inject(ANSIBLE_TASK_STATUS_REPOSITORY)
    private ansibleTaskStatusRepo: IAnsibleTaskStatusRepository,

    // Users module dependencies
    @Inject(USER_REPOSITORY) private userRepo: IUserRepository,

    // NestJS scheduler registry
    private readonly schedulerRegistry: SchedulerRegistry,
  ) {}

  /**
   * Initialize the automation engine when the module is loaded
   */
  async onModuleInit() {
    this.logger.log('Initializing AutomationEngine...');
    this.registerComponents();
    this.logger.log(`AutomationEngine initialized with ${this.components.size} automations`);
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
      this.components.set(
        automationToRegister.uuid,
        new AutomationComponent(
          automationToRegister.uuid,
          automationToRegister.name,
          automationToRegister.automationChains,
          this.automationRepository,
          this.containerUseCases,
          this.containerVolumeUseCases,
          this.ansibleTaskStatusRepo,
          this.userRepo,
          this.playbookUseCases,
          this.schedulerRegistry,
        ),
      );

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
          initError.stack,
          `Failed to initialize automation ${automationToRegister.name}: ${initError.message}`,
        );
        throw initError;
      }
    } catch (error: any) {
      this.logger.error(
        error.stack,
        `Failed to register automation ${automationToRegister.name}: ${error.message}`,
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
    if (!automation.uuid) {
      this.logger.warn('Automation has no UUID, skipping deregistration');
      return;
    }

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

    if (!automation.uuid) {
      throw new Error('Automation has no UUID, cannot execute');
    }

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
