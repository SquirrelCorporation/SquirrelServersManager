import { Automations } from 'ssm-shared-lib';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Events from '../../../../../core/events/events';
import AutomationRepo from '../../../../../data/database/repository/AutomationRepo';
import { AbstractActionComponent } from '../../../components/actions/abstract-action.component';

// Mock dependencies
vi.mock('../../../../logger', () => ({
  default: {
    child: () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
      child: vi.fn(),
    }),
  },
}));

// Mock Events module
vi.mock('../../../../../core/events/events', () => ({
  default: {
    emit: vi.fn(),
  },
}));

// Create a concrete implementation of AbstractActionComponent for testing
class TestActionComponent extends AbstractActionComponent {
  constructor(automationUuid: string, automationName: string) {
    super(automationUuid, automationName, Automations.Actions.CUSTOM);
  }

  async executeAction(): Promise<void> {
    // Implementation for testing
  }
}

describe('AbstractActionComponent', () => {
  let component: TestActionComponent;
  const mockAutomationUuid = 'test-uuid';
  const mockAutomationName = 'Test Automation';
  const mockAutomation = {
    uuid: mockAutomationUuid,
    name: mockAutomationName,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mocks
    AutomationRepo.findByUuid = vi.fn().mockResolvedValue(mockAutomation as any);
    AutomationRepo.setLastExecutionStatus = vi.fn().mockResolvedValue(undefined);

    // Create component
    component = new TestActionComponent(mockAutomationUuid, mockAutomationName);

    // Spy on component methods
    vi.spyOn(component, 'emit');
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should initialize with correct properties', () => {
    expect(component.type).toBe(Automations.Actions.CUSTOM);
    expect(component.automationUuid).toBe(mockAutomationUuid);
    expect(component.childLogger).toBeDefined();
  });

  describe('onSuccess', () => {
    it('should set automation status to success', async () => {
      await component.onSuccess();

      expect(AutomationRepo.findByUuid).toHaveBeenCalledWith(mockAutomationUuid);
      expect(AutomationRepo.setLastExecutionStatus).toHaveBeenCalledWith(mockAutomation, 'success');
    });

    it('should throw error if automation not found', async () => {
      AutomationRepo.findByUuid = vi.fn().mockResolvedValueOnce(null);

      await expect(component.onSuccess()).rejects.toThrow(
        `Automation with uuid ${mockAutomationUuid} not found`,
      );
    });
  });

  describe('onError', () => {
    it('should set automation status to failed', async () => {
      const errorMessage = 'Test error message';
      await component.onError(errorMessage);

      expect(AutomationRepo.findByUuid).toHaveBeenCalledWith(mockAutomationUuid);
      expect(AutomationRepo.setLastExecutionStatus).toHaveBeenCalledWith(mockAutomation, 'failed');
    });

    it('should emit AUTOMATION_FAILED event with provided message', async () => {
      const errorMessage = 'Test error message';
      await component.onError(errorMessage);

      expect(component.emit).toHaveBeenCalledWith(
        Events.AUTOMATION_FAILED,
        expect.objectContaining({
          message: errorMessage,
          severity: 'error',
          module: 'AutomationAction',
          moduleId: mockAutomationUuid,
        }),
      );
    });

    it('should emit AUTOMATION_FAILED event with default message if none provided', async () => {
      await component.onError();

      expect(component.emit).toHaveBeenCalledWith(
        Events.AUTOMATION_FAILED,
        expect.objectContaining({
          message: `The automation "${mockAutomationName}" failed`,
          severity: 'error',
          module: 'AutomationAction',
          moduleId: mockAutomationUuid,
        }),
      );
    });

    it('should throw error if automation not found', async () => {
      AutomationRepo.findByUuid = vi.fn().mockResolvedValueOnce(null);

      await expect(component.onError()).rejects.toThrow(
        `Automation with uuid ${mockAutomationUuid} not found`,
      );
    });
  });
});
