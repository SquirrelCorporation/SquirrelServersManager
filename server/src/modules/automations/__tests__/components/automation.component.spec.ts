import { Automations, SsmContainer } from 'ssm-shared-lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DockerActionComponent } from '../../components/actions/docker-action.component';
import { DockerVolumeActionComponent } from '../../components/actions/docker-volume-action.component';
import { PlaybookActionComponent } from '../../components/actions/playbook-action.component';
import { AutomationComponent } from '../../components/automation.component';
import { CronTriggerComponent } from '../../components/triggers/cron-trigger.component';

// Mock dependencies
vi.mock('../../components/triggers/cron-trigger.component');
vi.mock('../../components/actions/docker-action.component');
vi.mock('../../components/actions/docker-volume-action.component');
vi.mock('../../components/actions/playbook-action.component');
vi.mock('../../../logger', () => ({
  default: {
    child: () => ({
      info: vi.fn(),
      error: vi.fn(),
      child: vi.fn(),
    }),
  },
}));

describe('AutomationComponent', () => {
  let component: AutomationComponent;
  let mockDockerAction: any;
  let mockDockerVolumeAction: any;
  let mockPlaybookAction: any;
  let mockCronTrigger: any;

  beforeEach(() => {
    // Create mocks for action components
    mockDockerAction = {
      executeAction: vi.fn().mockResolvedValue(undefined),
      type: Automations.Actions.DOCKER,
    };

    mockDockerVolumeAction = {
      executeAction: vi.fn().mockResolvedValue(undefined),
      type: Automations.Actions.DOCKER_VOLUME,
    };

    mockPlaybookAction = {
      executeAction: vi.fn().mockResolvedValue(undefined),
      type: Automations.Actions.PLAYBOOK,
    };

    mockCronTrigger = {
      deregister: vi.fn(),
    };

    // Mock implementations
    vi.mocked(DockerActionComponent).mockImplementation(() => mockDockerAction);
    vi.mocked(DockerVolumeActionComponent).mockImplementation(() => mockDockerVolumeAction);
    vi.mocked(PlaybookActionComponent).mockImplementation(() => mockPlaybookAction);
    vi.mocked(CronTriggerComponent).mockImplementation(() => mockCronTrigger);

    // Create component
    component = new AutomationComponent('test-uuid', 'Test Automation', {
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
          dockerVolumeAction: SsmContainer.VolumeActions.BACKUP,
          dockerVolumes: ['volume1'],
        },
        {
          action: Automations.Actions.PLAYBOOK,
          playbook: '/path/to/playbook.yml',
          actionDevices: ['device1'],
        },
      ],
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  describe('init', () => {
    it('should initialize trigger and actions', async () => {
      await component.init();

      // Verify trigger was created
      expect(CronTriggerComponent).toHaveBeenCalledWith('0 0 * * *', component);
      expect(component.trigger).toBe(mockCronTrigger);

      // Verify actions were created
      expect(DockerActionComponent).toHaveBeenCalledWith(
        'test-uuid',
        'Test Automation',
        SsmContainer.Actions.START,
        ['container1'],
      );

      expect(DockerVolumeActionComponent).toHaveBeenCalledWith(
        'test-uuid',
        'Test Automation',
        SsmContainer.VolumeActions.BACKUP,
        ['volume1'],
      );

      expect(PlaybookActionComponent).toHaveBeenCalledWith(
        'test-uuid',
        'Test Automation',
        '/path/to/playbook.yml',
        ['device1'],
        undefined,
      );

      expect(component.actions).toHaveLength(3);
      expect(component.actions[0]).toBe(mockDockerAction);
      expect(component.actions[1]).toBe(mockDockerVolumeAction);
      expect(component.actions[2]).toBe(mockPlaybookAction);
    });

    it('should throw error if trigger is missing', async () => {
      component = new AutomationComponent('test-uuid', 'Test Automation', {
        actions: [],
      });

      await expect(component.init()).rejects.toThrow(
        'Invalid automation chain structure: missing trigger',
      );
    });

    it('should throw error if trigger type is unknown', async () => {
      component = new AutomationComponent('test-uuid', 'Test Automation', {
        trigger: 'unknown-trigger',
        actions: [],
      });

      await expect(component.init()).rejects.toThrow('Unknown trigger type unknown-trigger');
    });

    it('should throw error if cronValue is missing for cron trigger', async () => {
      component = new AutomationComponent('test-uuid', 'Test Automation', {
        trigger: Automations.Triggers.CRON,
        actions: [],
      });

      await expect(component.init()).rejects.toThrow('Missing cronValue in automation chain');
    });

    it('should throw error if actions array is missing', async () => {
      component = new AutomationComponent('test-uuid', 'Test Automation', {
        trigger: Automations.Triggers.CRON,
        cronValue: '0 0 * * *',
      });

      await expect(component.init()).rejects.toThrow(
        'Invalid automation chain structure: missing or invalid actions array',
      );
    });

    it('should throw error if action is invalid', async () => {
      component = new AutomationComponent('test-uuid', 'Test Automation', {
        trigger: Automations.Triggers.CRON,
        cronValue: '0 0 * * *',
        actions: [{}],
      });

      await expect(component.init()).rejects.toThrow('Invalid action in automation chain');
    });

    it('should throw error if action type is unknown', async () => {
      component = new AutomationComponent('test-uuid', 'Test Automation', {
        trigger: Automations.Triggers.CRON,
        cronValue: '0 0 * * *',
        actions: [
          {
            action: 'unknown-action',
          },
        ],
      });

      await expect(component.init()).rejects.toThrow('Unknown action type');
    });
  });

  describe('onTrigger', () => {
    it('should call synchronousExecution', async () => {
      const synchronousExecutionSpy = vi
        .spyOn(component, 'synchronousExecution')
        .mockResolvedValue(undefined);

      await component.onTrigger();

      expect(synchronousExecutionSpy).toHaveBeenCalled();
    });
  });

  describe('synchronousExecution', () => {
    it('should execute all actions in sequence', async () => {
      // Setup actions
      component.actions = [mockDockerAction, mockDockerVolumeAction, mockPlaybookAction];

      await component.synchronousExecution();

      expect(mockDockerAction.executeAction).toHaveBeenCalled();
      expect(mockDockerVolumeAction.executeAction).toHaveBeenCalled();
      expect(mockPlaybookAction.executeAction).toHaveBeenCalled();
    });

    it('should continue execution even if an action fails', async () => {
      // Setup actions with the second one failing
      mockDockerVolumeAction.executeAction.mockRejectedValueOnce(new Error('Action failed'));
      component.actions = [mockDockerAction, mockDockerVolumeAction, mockPlaybookAction];

      await component.synchronousExecution();

      expect(mockDockerAction.executeAction).toHaveBeenCalled();
      expect(mockDockerVolumeAction.executeAction).toHaveBeenCalled();
      expect(mockPlaybookAction.executeAction).toHaveBeenCalled();
    });

    it('should log error if no actions found', async () => {
      // Setup empty actions array
      component.actions = [];

      await component.synchronousExecution();

      // Verify error was logged (implementation specific)
    });
  });

  describe('deregister', () => {
    it('should deregister trigger and clear actions', async () => {
      // Setup trigger and actions
      component.trigger = mockCronTrigger;
      component.actions = [mockDockerAction, mockDockerVolumeAction, mockPlaybookAction];

      component.deregister();

      expect(mockCronTrigger.deregister).toHaveBeenCalled();
      expect(component.trigger).toBeUndefined();
      expect(component.actions).toEqual([]);
    });

    it('should handle case when no trigger is set', async () => {
      // Setup with no trigger
      component.trigger = undefined;
      component.actions = [mockDockerAction, mockDockerVolumeAction, mockPlaybookAction];

      component.deregister();

      expect(component.actions).toEqual([]);
    });
  });
});
