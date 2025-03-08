import * as CronJob from 'node-cron';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AutomationComponent } from '../../../../domain/components/automation.component';
import { CronTriggerComponent } from '../../../../domain/components/triggers/cron-trigger.component';

vi.mock('node-cron');
vi.mock('../../../../domain/components/automation.component');

describe('CronTriggerComponent', () => {
  let cronTriggerComponent: CronTriggerComponent;
  let automationComponent: AutomationComponent;

  const cronExpression = '*/5 * * * *';

  beforeEach(async () => {
    vi.clearAllMocks();

    // Mock schedule method
    const mockSchedule = vi.fn().mockReturnValue({
      stop: vi.fn(),
    });
    (CronJob.schedule as any) = mockSchedule;

    // Create a mock automation component
    automationComponent = new AutomationComponent(
      '1234',
      'Test Automation',
      {},
      {} as any // Mock automationRepository
    );
    automationComponent.childLogger = {
      info: vi.fn(),
      error: vi.fn(),
    } as any;
    automationComponent.onTrigger = vi.fn();

    // Create the trigger component
    cronTriggerComponent = new CronTriggerComponent(cronExpression, automationComponent);
  });

  it('should be defined', () => {
    expect(cronTriggerComponent).toBeDefined();
  });

  it('should create a cron schedule on initialization', () => {
    expect(CronJob.schedule).toHaveBeenCalledTimes(1);
    expect(CronJob.schedule).toHaveBeenCalledWith(cronExpression, expect.any(Function));
    expect(automationComponent.childLogger.info).toHaveBeenCalledTimes(1);
    expect(automationComponent.childLogger.info).toHaveBeenCalledWith(
      `Registered cron trigger with expression: ${cronExpression}`,
    );
  });

  it('should call onTrigger when cron job executes', () => {
    // Get the callback function that was passed to schedule
    const cronCallback = (CronJob.schedule as any).mock.calls[0][1];

    // Execute the callback
    cronCallback();

    expect(automationComponent.onTrigger).toHaveBeenCalledTimes(1);
  });

  it('should stop the cron job when deregistered', () => {
    const stopMethod = cronTriggerComponent.cron?.stop as any;

    // Reset the info mock to clear previous calls from initialization
    (automationComponent.childLogger.info as any).mockClear();

    cronTriggerComponent.deregister();

    expect(stopMethod).toHaveBeenCalledTimes(1);
    expect(automationComponent.childLogger.info).toHaveBeenCalledTimes(1);
    expect(automationComponent.childLogger.info).toHaveBeenCalledWith('Deregistered cron trigger');
  });
});
