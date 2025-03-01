import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AutomationComponent } from './components/automation.component';
import { Automation, AutomationDocument } from './schemas/automation.schema';

@Injectable()
export class AutomationEngine implements OnModuleInit {
  private readonly logger = new Logger(AutomationEngine.name);
  private automations: { [id: string]: AutomationComponent } = {};

  constructor(@InjectModel(Automation.name) private automationModel: Model<AutomationDocument>) {}

  /**
   * Initialize the automation engine when the module is loaded
   */
  async onModuleInit() {
    this.logger.log('Initializing AutomationEngine...');
    await this.registerComponents();
    this.logger.log(
      `AutomationEngine initialized with ${Object.keys(this.automations).length} automations`,
    );
  }

  /**
   * Get the current state of all registered automations
   */
  getStates() {
    return { automation: this.automations };
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
      this.automations[automationToRegister.uuid] = new AutomationComponent(
        automationToRegister.uuid,
        automationToRegister.name,
        automationToRegister.automationChains,
      );

      // Initialize the component
      try {
        await this.automations[automationToRegister.uuid].init();
        this.logger.log(`Successfully registered automation: ${automationToRegister.name}`);
      } catch (initError: any) {
        // If initialization fails, clean up the component and rethrow
        delete this.automations[automationToRegister.uuid];
        this.logger.error(
          `Failed to initialize automation ${automationToRegister.name}: ${initError.message}`,
        );
        throw initError;
      }
    } catch (error: any) {
      this.logger.error(
        `Failed to register automation ${automationToRegister.name}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Register all enabled automations from the database
   */
  async registerComponents() {
    this.logger.log('Registering all enabled automations...');

    try {
      const automations = await this.automationModel.find({ enabled: true }).lean().exec();

      if (automations && automations.length > 0) {
        this.logger.log(`Found ${automations.length} enabled automations`);

        await Promise.all(automations.map((automation) => this.registerComponent(automation)));

        this.logger.log('All automations registered successfully');
      } else {
        this.logger.log('No enabled automations found');
      }
    } catch (error: any) {
      this.logger.error(`Failed to register automations: ${error.message}`);
      throw error;
    }
  }

  /**
   * Deregister an automation component
   * @param automation The automation to deregister
   */
  async deregisterComponent(automation: Automation) {
    this.logger.log(`Deregistering automation: ${automation.name} (${automation.uuid})`);

    const registeredAutomationComponent = this.automations[automation.uuid];

    if (!registeredAutomationComponent) {
      const errorMessage = `Could not deregister automation component with uuid: ${automation.uuid}`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      registeredAutomationComponent.deregister();
      delete this.automations[automation.uuid];
      this.logger.log(`Successfully deregistered automation: ${automation.name}`);
    } catch (error: any) {
      this.logger.error(`Error deregistering automation ${automation.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Execute an automation manually
   * @param automation The automation to execute
   */
  async executeAutomation(automation: Automation) {
    this.logger.log(`Executing automation: ${automation.name} (${automation.uuid})`);

    const registeredAutomationComponent = this.automations[automation.uuid];

    if (!registeredAutomationComponent) {
      const errorMessage = `Automation with uuid: ${automation.uuid} not registered`;
      this.logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    try {
      await registeredAutomationComponent.synchronousExecution();
      this.logger.log(`Successfully executed automation: ${automation.name}`);
    } catch (error: any) {
      this.logger.error(`Error executing automation ${automation.name}: ${error.message}`);
      throw error;
    }
  }
}
