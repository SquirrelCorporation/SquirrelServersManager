import { Automations, SsmAnsible } from 'ssm-shared-lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AnsibleTaskStatusRepo from '../../../../../data/database/repository/AnsibleTaskStatusRepo';
import AutomationRepo from '../../../../../data/database/repository/AutomationRepo';
import PlaybookRepo from '../../../../../data/database/repository/PlaybookRepo';
import { IUserRepository } from '../../../../users/domain/repositories/user-repository.interface';
import PlaybookUseCases from '../../../../../services/PlaybookUseCases';
import { PlaybookActionComponent } from '../../../components/actions/playbook-action.component';

// Mock dependencies
vi.mock('../../../../../logger', () => ({
  default: {
    child: () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      child: vi.fn(),
    }),
  },
}));

// Create a mock user repository
const mockUserRepository: IUserRepository = {
  findFirst: vi.fn(),
  findByEmail: vi.fn(),
  findByEmailAndPassword: vi.fn(),
  findByApiKey: vi.fn(),
  findAll: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  updateApiKey: vi.fn(),
  updateLogsLevel: vi.fn(),
};

// Mock the PlaybookActionComponent to use our mock repository
vi.mock('../../../components/actions/playbook-action.component', async () => {
  const actual = await vi.importActual<any>('../../../components/actions/playbook-action.component');
  return {
    ...actual,
    PlaybookActionComponent: class extends actual.PlaybookActionComponent {
      constructor(...args: any[]) {
        super(...args);
        this.userRepo = mockUserRepository;
      }
    }
  };
});

vi.mock('../../../../../data/database/repository/PlaybookRepo', () => ({
  default: {
    findOneByUuid: vi.fn(),
  },
}));

vi.mock('../../../../../data/database/repository/AnsibleTaskStatusRepo', () => ({
  default: {
    findAllByIdent: vi.fn(),
  },
}));

vi.mock('../../../../../data/database/repository/AutomationRepo', () => ({
  default: {
    findByUuid: vi.fn(),
    setLastExecutionStatus: vi.fn(),
  },
}));

vi.mock('../../../../../services/PlaybookUseCases', () => ({
  default: {
    executePlaybook: vi.fn(),
  },
}));

describe('PlaybookActionComponent', () => {
  let component: PlaybookActionComponent;
  const mockAutomationUuid = 'test-automation-uuid';
  const mockAutomationName = 'Test Automation';
  const mockPlaybookUuid = 'test-playbook-uuid';
  const mockTargets = ['target1', 'target2'];
  const mockExtraVars = { var1: 'value1', var2: 'value2' };
  const mockExecId = 'test-exec-id';

  const mockUser = { id: 'user-id', name: 'Test User' };
  const mockPlaybook = {
    uuid: mockPlaybookUuid,
    name: 'Test Playbook',
    path: '/path/to/playbook.yml',
  };
  const mockAutomation = {
    uuid: mockAutomationUuid,
    name: mockAutomationName,
  };

  beforeEach(() => {
    vi.useFakeTimers();

    // Setup default mocks
    vi.mocked(mockUserRepository.findFirst).mockResolvedValue(mockUser as any);
    vi.mocked(PlaybookRepo.findOneByUuid).mockResolvedValue(mockPlaybook as any);
    vi.mocked(PlaybookUseCases.executePlaybook).mockResolvedValue(mockExecId);
    vi.mocked(AutomationRepo.findByUuid).mockResolvedValue(mockAutomation as any);
    vi.mocked(AutomationRepo.setLastExecutionStatus).mockResolvedValue(undefined);

    // Create component
    component = new PlaybookActionComponent(
      mockAutomationUuid,
      mockAutomationName,
      mockPlaybookUuid,
      mockTargets,
      mockExtraVars,
    );

    // Spy on component methods
    vi.spyOn(component, 'waitForResult').mockImplementation(async () => {});
    vi.spyOn(component, 'onSuccess').mockImplementation(async () => {});
    vi.spyOn(component, 'onError').mockImplementation(async () => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.useRealTimers();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should initialize with correct properties', () => {
    expect(component.type).toBe(Automations.Actions.PLAYBOOK);
    expect(component.playbookUuid).toBe(mockPlaybookUuid);
    expect(component.targets).toEqual(mockTargets);
    expect(component.extraVarsForcedValues).toEqual(mockExtraVars);
    expect(component.automationUuid).toBe(mockAutomationUuid);
  });

  it('should throw error if initialized with empty parameters', () => {
    expect(
      () => new PlaybookActionComponent(mockAutomationUuid, mockAutomationName, '', mockTargets),
    ).toThrow('Empty parameters');

    expect(
      () =>
        new PlaybookActionComponent(mockAutomationUuid, mockAutomationName, mockPlaybookUuid, []),
    ).toThrow('Empty parameters');
  });

  describe('executeAction', () => {
    it('should execute playbook successfully', async () => {
      await component.executeAction();

      expect(mockUserRepository.findFirst).toHaveBeenCalled();
      expect(PlaybookRepo.findOneByUuid).toHaveBeenCalledWith(mockPlaybookUuid);
      expect(PlaybookUseCases.executePlaybook).toHaveBeenCalledWith(
        mockPlaybook,
        mockUser,
        mockTargets,
        mockExtraVars,
      );
      expect(component.waitForResult).toHaveBeenCalledWith(mockExecId);
    });

    it('should handle playbook not found', async () => {
      vi.mocked(PlaybookRepo.findOneByUuid).mockResolvedValueOnce(null);

      await component.executeAction();

      expect(PlaybookUseCases.executePlaybook).not.toHaveBeenCalled();
      expect(component.onError).toHaveBeenCalledWith(`Playbook ${mockPlaybookUuid} does not exist`);
    });

    it('should handle execution error', async () => {
      const mockError = new Error('Execution failed');
      vi.mocked(PlaybookUseCases.executePlaybook).mockRejectedValueOnce(mockError);

      await component.executeAction();

      expect(component.onError).toHaveBeenCalledWith('Execution failed');
    });
  });

  describe('waitForResult', () => {
    beforeEach(() => {
      // Restore the actual implementation for testing
      vi.mocked(component.waitForResult).mockRestore();
      vi.mocked(component.onSuccess).mockRestore();
      vi.mocked(component.onError).mockRestore();

      // Spy on the methods again to track calls
      vi.spyOn(component, 'onSuccess');
      vi.spyOn(component, 'onError');
    });

    it('should handle successful execution', async () => {
      const mockStatus = {
        status: SsmAnsible.AnsibleTaskStatus.SUCCESS,
        ident: mockExecId,
      };

      vi.mocked(AnsibleTaskStatusRepo.findAllByIdent).mockResolvedValueOnce([mockStatus] as any);

      await component.waitForResult(mockExecId);

      expect(AnsibleTaskStatusRepo.findAllByIdent).toHaveBeenCalledWith(mockExecId);
      expect(component.onSuccess).toHaveBeenCalled();
      expect(component.onError).not.toHaveBeenCalled();
    });

    it('should handle failed execution', async () => {
      const mockStatus = {
        status: SsmAnsible.AnsibleTaskStatus.FAILED,
        ident: mockExecId,
      };

      vi.mocked(AnsibleTaskStatusRepo.findAllByIdent).mockResolvedValueOnce([mockStatus] as any);

      await component.waitForResult(mockExecId);

      expect(AnsibleTaskStatusRepo.findAllByIdent).toHaveBeenCalledWith(mockExecId);
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).toHaveBeenCalledWith(
        `Playbook execution failed with status: ${SsmAnsible.AnsibleTaskStatus.FAILED}`,
      );
    });

    it('should handle canceled execution', async () => {
      const mockStatus = {
        status: SsmAnsible.AnsibleTaskStatus.CANCELED,
        ident: mockExecId,
      };

      vi.mocked(AnsibleTaskStatusRepo.findAllByIdent).mockResolvedValueOnce([mockStatus] as any);

      await component.waitForResult(mockExecId);

      expect(AnsibleTaskStatusRepo.findAllByIdent).toHaveBeenCalledWith(mockExecId);
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).toHaveBeenCalledWith(
        `Playbook execution failed with status: ${SsmAnsible.AnsibleTaskStatus.CANCELED}`,
      );
    });

    it('should retry if status is not final', async () => {
      const mockStatus = {
        status: SsmAnsible.AnsibleTaskStatus.RUNNING,
      };

      // Reset all mocks to ensure clean state
      vi.resetAllMocks();

      // Setup the mock to return a non-final status
      vi.mocked(AnsibleTaskStatusRepo.findAllByIdent).mockResolvedValueOnce([mockStatus] as any);

      // Mock setTimeout to call the callback immediately
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn((callback) => {
        callback();
        return 1 as any;
      });

      // Create a new spy that doesn't override the implementation
      const waitForResultSpy = vi.spyOn(component, 'waitForResult');

      // Create a counter to prevent infinite recursion
      let callCount = 0;
      waitForResultSpy.mockImplementation(async (execId, count = 0) => {
        callCount++;
        if (callCount === 1) {
          // For the first call, use the original implementation
          return PlaybookActionComponent.prototype.waitForResult.call(component, execId, count);
        }
        // For subsequent calls, do nothing to prevent infinite recursion
        return;
      });

      await component.waitForResult(mockExecId);

      expect(AnsibleTaskStatusRepo.findAllByIdent).toHaveBeenCalledWith(mockExecId);
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).not.toHaveBeenCalled();
      expect(waitForResultSpy).toHaveBeenCalledTimes(2);
      expect(global.setTimeout).toHaveBeenCalled();

      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it('should retry if no status found yet', async () => {
      // Reset all mocks to ensure clean state
      vi.resetAllMocks();

      // Setup the mock to return an empty array
      vi.mocked(AnsibleTaskStatusRepo.findAllByIdent).mockResolvedValueOnce([]);

      // Mock setTimeout to call the callback immediately
      const originalSetTimeout = global.setTimeout;
      global.setTimeout = vi.fn((callback) => {
        callback();
        return 1 as any;
      });

      // Create a new spy that doesn't override the implementation
      const waitForResultSpy = vi.spyOn(component, 'waitForResult');

      // Create a counter to prevent infinite recursion
      let callCount = 0;
      waitForResultSpy.mockImplementation(async (execId, count = 0) => {
        callCount++;
        if (callCount === 1) {
          // For the first call, use the original implementation
          return PlaybookActionComponent.prototype.waitForResult.call(component, execId, count);
        }
        // For subsequent calls, do nothing to prevent infinite recursion
        return;
      });

      await component.waitForResult(mockExecId);

      expect(AnsibleTaskStatusRepo.findAllByIdent).toHaveBeenCalledWith(mockExecId);
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).not.toHaveBeenCalled();
      expect(waitForResultSpy).toHaveBeenCalledTimes(2);
      expect(global.setTimeout).toHaveBeenCalled();

      // Restore setTimeout
      global.setTimeout = originalSetTimeout;
    });

    it('should timeout after 100 retries', async () => {
      await component.waitForResult(mockExecId, 101);

      expect(component.onError).toHaveBeenCalledWith('Timeout reached for task');
    });

    it('should handle error during status check', async () => {
      const mockError = new Error('Database error');
      vi.mocked(AnsibleTaskStatusRepo.findAllByIdent).mockRejectedValueOnce(mockError);

      await component.waitForResult(mockExecId);

      expect(component.onError).toHaveBeenCalledWith('Database error');
    });
  });

  describe('isFinalStatus', () => {
    it('should correctly identify final statuses', () => {
      expect(PlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.SUCCESS)).toBe(
        true,
      );
      expect(PlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.FAILED)).toBe(true);
      expect(PlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.CANCELED)).toBe(
        true,
      );
      expect(PlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.TIMEOUT)).toBe(
        true,
      );

      expect(PlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.RUNNING)).toBe(
        false,
      );
      expect(PlaybookActionComponent.isFinalStatus(SsmAnsible.AnsibleTaskStatus.PENDING)).toBe(
        false,
      );
      expect(PlaybookActionComponent.isFinalStatus('unknown')).toBe(false);
    });
  });
});
