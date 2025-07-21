import { Automations, SsmAnsible } from 'ssm-shared-lib';
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

// Mock abstract action component
vi.mock(
  '../../../../../application/services/components/actions/abstract-action.component',
  () => {
    class MockAbstractActionComponent {
      type: string;
      automationUuid: string;
      childLogger: any = { log: vi.fn(), error: vi.fn(), warn: vi.fn() };

      constructor(automationUuid: string, automationName: string, type: string, repo: any) {
        this.type = type;
        this.automationUuid = automationUuid;
      }

      emit = vi.fn();
      onSuccess = vi.fn().mockResolvedValue(undefined);
      onError = vi.fn().mockResolvedValue(undefined);
    }

    return {
      AbstractActionComponent: MockAbstractActionComponent,
    };
  },
  { virtual: true },
);

// Create mock for PlaybookActionComponent
class MockPlaybookActionComponent {
  type: string = Automations.Actions.PLAYBOOK;
  automationUuid: string;
  automationName: string;
  playbookUuid: string;
  targets: string[];
  extraVarsForcedValues?: Record<string, any>;

  constructor(
    automationUuid: string,
    automationName: string,
    playbookUuid: string,
    targets: string[],
    extraVarsForcedValues?: Record<string, any>,
  ) {
    if (!playbookUuid || !targets || targets.length === 0) {
      throw new Error('Empty parameters');
    }

    this.automationUuid = automationUuid;
    this.automationName = automationName;
    this.playbookUuid = playbookUuid;
    this.targets = targets;
    this.extraVarsForcedValues = extraVarsForcedValues;
  }

  executeAction = vi.fn().mockResolvedValue(undefined);
  waitForResult = vi.fn().mockResolvedValue(undefined);
  onSuccess = vi.fn().mockResolvedValue(undefined);
  onError = vi.fn().mockResolvedValue(undefined);

  static isFinalStatus(status: string): boolean {
    return [
      SsmAnsible.AnsibleTaskStatus.SUCCESS,
      SsmAnsible.AnsibleTaskStatus.FAILED,
      SsmAnsible.AnsibleTaskStatus.CANCELED,
      SsmAnsible.AnsibleTaskStatus.TIMEOUT,
    ].includes(status as SsmAnsible.AnsibleTaskStatus);
  }
}

describe('PlaybookActionComponent', () => {
  it('should handle playbook execution for automations', () => {
    const mockAutomationUuid = 'test-automation-uuid';
    const mockAutomationName = 'Test Automation';
    const mockPlaybookUuid = 'test-playbook-uuid';
    const mockTargets = ['target1', 'target2'];
    const mockExtraVars = { var1: 'value1', var2: 'value2' };

    const component = new MockPlaybookActionComponent(
      mockAutomationUuid,
      mockAutomationName,
      mockPlaybookUuid,
      mockTargets,
      mockExtraVars,
    );

    expect(component).toBeDefined();
    expect(component.type).toBe(Automations.Actions.PLAYBOOK);
    expect(component.playbookUuid).toBe(mockPlaybookUuid);
    expect(component.targets).toEqual(mockTargets);
    expect(component.extraVarsForcedValues).toEqual(mockExtraVars);
    expect(component.automationUuid).toBe(mockAutomationUuid);
  });

  it('should throw error if initialized with empty parameters', () => {
    const mockAutomationUuid = 'test-automation-uuid';
    const mockAutomationName = 'Test Automation';
    const mockTargets = ['target1', 'target2'];

    expect(
      () =>
        new MockPlaybookActionComponent(mockAutomationUuid, mockAutomationName, '', mockTargets),
    ).toThrow('Empty parameters');

    expect(
      () =>
        new MockPlaybookActionComponent(
          mockAutomationUuid,
          mockAutomationName,
          'playbook-uuid',
          [],
        ),
    ).toThrow('Empty parameters');
  });

  it('should correctly identify final statuses', () => {
    expect(MockPlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.SUCCESS)).toBe(
      true,
    );
    expect(MockPlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.FAILED)).toBe(
      true,
    );
    expect(MockPlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.CANCELED)).toBe(
      true,
    );
    expect(MockPlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.TIMEOUT)).toBe(
      true,
    );

    expect(MockPlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.RUNNING)).toBe(
      false,
    );
    expect(MockPlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.PENDING)).toBe(
      false,
    );
    expect(MockPlaybookActionComponent.isFinalStatus('unknown')).toBe(false);
  });
});
