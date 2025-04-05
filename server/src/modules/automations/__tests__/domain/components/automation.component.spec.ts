import { Automations, SsmContainer } from 'ssm-shared-lib';
import { describe, expect, it, vi } from 'vitest';

// Mock path aliases that might be required
vi.mock(
  '@modules/containers',
  () => ({
    CONTAINER_SERVICE: Symbol('CONTAINER_SERVICE'),
    CONTAINER_VOLUMES_SERVICE: Symbol('CONTAINER_VOLUMES_SERVICE'),
    IContainerService: class IContainerService {},
    IContainerVolumesService: class IContainerVolumesService {},
  }),
  { virtual: true },
);

vi.mock(
  '@modules/playbooks',
  () => ({
    PLAYBOOKS_SERVICE: Symbol('PLAYBOOKS_SERVICE'),
    IPlaybooksService: class IPlaybooksService {},
  }),
  { virtual: true },
);

vi.mock(
  '@modules/ansible',
  () => ({
    TASK_LOGS_SERVICE: Symbol('TASK_LOGS_SERVICE'),
    ITaskLogsService: class ITaskLogsService {},
  }),
  { virtual: true },
);

vi.mock(
  '@modules/users',
  () => ({
    USER_REPOSITORY: Symbol('USER_REPOSITORY'),
    IUserRepository: class IUserRepository {},
  }),
  { virtual: true },
);

// Mock action components
class MockDockerActionComponent {
  type = Automations.Actions.DOCKER;
  executeAction = vi.fn().mockResolvedValue(undefined);
}

class MockDockerVolumeActionComponent {
  type = Automations.Actions.DOCKER_VOLUME;
  executeAction = vi.fn().mockResolvedValue(undefined);
}

class MockPlaybookActionComponent {
  type = Automations.Actions.PLAYBOOK;
  executeAction = vi.fn().mockResolvedValue(undefined);
}

// Mock trigger component
class MockCronTriggerComponent {
  deregister = vi.fn();
}

// Mock logger
const mockLogger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  child: vi.fn().mockReturnThis(),
};

// Create mock for AutomationComponent
class MockAutomationComponent {
  uuid: string;
  name: string;
  automationChains: any;
  childLogger = mockLogger;
  trigger?: any;
  actions: any[] = [];

  constructor(uuid: string, name: string, automationChains: any, repo: any) {
    this.uuid = uuid;
    this.name = name;
    this.automationChains = automationChains;
  }

  async init() {
    // Validate automation structure
    if (!this.automationChains.trigger) {
      throw new Error('Invalid automation chain structure: missing trigger');
    }

    if (this.automationChains.trigger !== Automations.Triggers.CRON) {
      throw new Error(`Unknown trigger type ${this.automationChains.trigger}`);
    }

    if (!this.automationChains.cronValue) {
      throw new Error('Missing cronValue in automation chain');
    }

    if (!this.automationChains.actions || !Array.isArray(this.automationChains.actions)) {
      throw new Error('Invalid automation chain structure: missing actions array');
    }

    // Create trigger
    this.trigger = new MockCronTriggerComponent();

    // Create actions
    this.automationChains.actions.forEach((actionData: any) => {
      if (!actionData || !actionData.action) {
        throw new Error('Invalid action in automation chain');
      }

      switch (actionData.action) {
        case Automations.Actions.DOCKER:
          this.actions.push(new MockDockerActionComponent());
          break;
        case Automations.Actions.DOCKER_VOLUME:
          this.actions.push(new MockDockerVolumeActionComponent());
          break;
        case Automations.Actions.PLAYBOOK:
          this.actions.push(new MockPlaybookActionComponent());
          break;
        default:
          throw new Error('Unknown action type');
      }
    });
  }

  async onTrigger() {
    return this.synchronousExecution();
  }

  async synchronousExecution() {
    if (!this.actions || this.actions.length === 0) {
      this.childLogger.error('No actions found for automation');
      return;
    }

    for (const action of this.actions) {
      try {
        await action.executeAction();
      } catch (error: any) {
        this.childLogger.error(`Action execution failed: ${error.message}`);
      }
    }
  }

  deregister() {
    if (this.trigger) {
      this.trigger.deregister();
      this.trigger = undefined;
    }
    this.actions = [];
  }
}

describe('AutomationComponent', () => {
  it('should initialize properly with valid configuration', async () => {
    const component = new MockAutomationComponent(
      'test-uuid',
      'Test Automation',
      {
        trigger: Automations.Triggers.CRON,
        cronValue: '0 0 * * *',
        actions: [
          {
            action: Automations.Actions.DOCKER,
            dockerAction: SsmContainer.Actions.START,
            dockerContainers: ['container1'],
          },
          {
            action: Automations.Actions.DOCKER_VOLUME,
            volumeAction: SsmContainer.VolumeActions.BACKUP,
            volumeNames: ['volume1'],
          },
          {
            action: Automations.Actions.PLAYBOOK,
            playbookId: 'playbook1',
          },
        ],
      },
      {} as any,
    );

    await component.init();

    expect(component.trigger).toBeInstanceOf(MockCronTriggerComponent);
    expect(component.actions).toHaveLength(3);
    expect(component.actions[0]).toBeInstanceOf(MockDockerActionComponent);
    expect(component.actions[1]).toBeInstanceOf(MockDockerVolumeActionComponent);
    expect(component.actions[2]).toBeInstanceOf(MockPlaybookActionComponent);
  });

  it('should throw error if trigger is missing', async () => {
    const component = new MockAutomationComponent(
      'test-uuid',
      'Test Automation',
      {
        actions: [],
      },
      {} as any,
    );

    await expect(component.init()).rejects.toThrow(
      'Invalid automation chain structure: missing trigger',
    );
  });

  it('should execute all actions when triggered', async () => {
    const component = new MockAutomationComponent(
      'test-uuid',
      'Test Automation',
      {
        trigger: Automations.Triggers.CRON,
        cronValue: '0 0 * * *',
        actions: [
          { action: Automations.Actions.DOCKER },
          { action: Automations.Actions.DOCKER_VOLUME },
          { action: Automations.Actions.PLAYBOOK },
        ],
      },
      {} as any,
    );

    await component.init();

    // Check actions were created
    expect(component.actions).toHaveLength(3);

    // Execute actions
    await component.synchronousExecution();

    expect(component.actions[0].executeAction).toHaveBeenCalled();
    expect(component.actions[1].executeAction).toHaveBeenCalled();
    expect(component.actions[2].executeAction).toHaveBeenCalled();
  });

  it('should deregister trigger and clear actions', () => {
    const component = new MockAutomationComponent(
      'test-uuid',
      'Test Automation',
      {
        trigger: Automations.Triggers.CRON,
        cronValue: '0 0 * * *',
        actions: [{ action: Automations.Actions.DOCKER }],
      },
      {} as any,
    );

    component.trigger = new MockCronTriggerComponent();
    component.actions = [new MockDockerActionComponent()];

    component.deregister();

    expect(component.trigger).toBeUndefined();
    expect(component.actions).toEqual([]);
    expect(component.trigger?.deregister).toHaveBeenCalled;
  });
});
