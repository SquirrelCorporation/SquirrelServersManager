import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Automations } from 'ssm-shared-lib';
import AutomationComponent from '../../../modules/automations/AutomationComponent';
import CronTriggerComponent from '../../../modules/automations/triggers/CronTriggerComponent';
import DockerActionComponent from '../../../modules/automations/actions/DockerActionComponent';
import PlaybookActionComponent from '../../../modules/automations/actions/PlaybookActionComponent';

vi.mock('./../../../modules/automations/triggers/CronTriggerComponent');
vi.mock('./../../../modules/automations/actions/DockerActionComponent');
vi.mock('./../../../modules/automations/actions/PlaybookActionComponent');

const uuid = '123';
const name = 'automation-name';
const getAutomationChain = () => {
  return {
    trigger: Automations.Triggers.CRON,
    cronValue: '10 * * * *',
    actions: [
      {
        action: Automations.Actions.DOCKER,
        dockerAction: 'start',
        dockerContainers: ['container1', 'container2'],
        playbook: 'playbook1',
        actionDevices: ['device1', 'device2'],
      },
    ],
  };
};
describe('init method of AutomationComponent class', () => {
  let automation: AutomationComponent;

  beforeEach(() => {
    automation = new AutomationComponent(uuid, name, getAutomationChain());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('should properly initialize trigger for cron trigger type', async () => {
    automation.automationChain.trigger = Automations.Triggers.CRON;
    await automation.init();
    expect(automation.trigger).toBeInstanceOf(CronTriggerComponent);
  });

  test('should throw error for unknown trigger type', async () => {
    // @ts-expect-error provoke error
    automation.automationChain.trigger = 'Unknown';
    expect(automation.init()).rejects.toThrow('Unknown trigger type');
  });

  test('should properly initialize actions for docker action type', async () => {
    automation.automationChain.actions[0].action = Automations.Actions.DOCKER;
    await automation.init();
    automation.actions?.forEach((action) => {
      expect(action).toBeInstanceOf(DockerActionComponent);
    });
  });

  test('should properly initialize actions for playbook action type', async () => {
    automation.automationChain.actions[0].action = Automations.Actions.PLAYBOOK;
    await automation.init();
    automation.actions?.forEach((action) => {
      expect(action).toBeInstanceOf(PlaybookActionComponent);
    });
  });

  test('should throw error for unknown action type', async () => {
    // @ts-expect-error provoke error
    automation.automationChain.actions[0].action = 'Unknown';
    expect(automation.init()).rejects.toThrow('Unknown action type');
  });
});
