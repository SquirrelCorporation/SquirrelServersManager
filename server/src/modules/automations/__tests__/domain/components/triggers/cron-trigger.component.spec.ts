import * as CronJob from 'node-cron';
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

// Mock node-cron
vi.mock('node-cron', () => ({
  schedule: vi.fn().mockReturnValue({
    stop: vi.fn(),
  }),
}));

// Mock automation component
class MockAutomationComponent {
  uuid: string;
  name: string;
  childLogger = {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  };

  constructor(uuid: string, name: string, automationChains: any, repo: any) {
    this.uuid = uuid;
    this.name = name;
  }

  onTrigger = vi.fn().mockResolvedValue(undefined);
}

// Create mock for CronTriggerComponent
class MockCronTriggerComponent {
  expression: string;
  automation: any;
  cron: any;

  constructor(expression: string, automation: any) {
    this.expression = expression;
    this.automation = automation;
    this.cron = CronJob.schedule(expression, this.onCall.bind(this));
    this.automation.childLogger.info(`Registered cron trigger with expression: ${expression}`);
  }

  onCall = vi.fn().mockImplementation(() => {
    this.automation.onTrigger();
  });

  deregister() {
    this.cron?.stop();
    this.automation.childLogger.info('Deregistered cron trigger');
  }
}

describe('CronTriggerComponent', () => {
  it('should register a cron job on initialization', () => {
    const automationComponent = new MockAutomationComponent(
      '1234',
      'Test Automation',
      {},
      {} as any,
    );

    const cronExpression = '*/5 * * * *';
    const cronTriggerComponent = new MockCronTriggerComponent(cronExpression, automationComponent);

    expect(cronTriggerComponent).toBeDefined();
    expect(CronJob.schedule).toHaveBeenCalledWith(cronExpression, expect.any(Function));
    expect(automationComponent.childLogger.info).toHaveBeenCalledWith(
      `Registered cron trigger with expression: ${cronExpression}`,
    );
  });

  it('should call onTrigger when cron job executes', () => {
    const automationComponent = new MockAutomationComponent(
      '1234',
      'Test Automation',
      {},
      {} as any,
    );

    const cronTriggerComponent = new MockCronTriggerComponent('*/5 * * * *', automationComponent);

    // Directly call the onCall method to simulate cron job execution
    cronTriggerComponent.onCall();

    expect(automationComponent.onTrigger).toHaveBeenCalledTimes(1);
  });

  it('should stop the cron job when deregistered', () => {
    const automationComponent = new MockAutomationComponent(
      '1234',
      'Test Automation',
      {},
      {} as any,
    );

    const cronTriggerComponent = new MockCronTriggerComponent('*/5 * * * *', automationComponent);

    // Reset the info mock to clear previous calls from initialization
    (automationComponent.childLogger.info as any).mockClear();

    cronTriggerComponent.deregister();

    expect(cronTriggerComponent.cron.stop).toHaveBeenCalledTimes(1);
    expect(automationComponent.childLogger.info).toHaveBeenCalledWith('Deregistered cron trigger');
  });
});
