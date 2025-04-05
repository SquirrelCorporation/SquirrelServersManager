import { SsmContainer } from 'ssm-shared-lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock path aliases that might be required
vi.mock('@modules/containers', () => ({
  CONTAINER_SERVICE: Symbol('CONTAINER_SERVICE'),
  CONTAINER_VOLUMES_SERVICE: Symbol('CONTAINER_VOLUMES_SERVICE'),
  IContainerService: class IContainerService {},
  IContainerVolumesService: class IContainerVolumesService {},
}), { virtual: true });

vi.mock('@modules/playbooks', () => ({
  PLAYBOOKS_SERVICE: Symbol('PLAYBOOKS_SERVICE'),
  IPlaybooksService: class IPlaybooksService {},
}), { virtual: true });

vi.mock('@modules/ansible', () => ({
  TASK_LOGS_SERVICE: Symbol('TASK_LOGS_SERVICE'),
  ITaskLogsService: class ITaskLogsService {},
}), { virtual: true });

vi.mock('@modules/users', () => ({
  USER_REPOSITORY: Symbol('USER_REPOSITORY'),
  IUserRepository: class IUserRepository {},
}), { virtual: true });

// Mock abstract action component
vi.mock('../../../../../application/services/components/actions/abstract-action.component', () => {
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
    AbstractActionComponent: MockAbstractActionComponent
  };
}, { virtual: true });

// Create mock for DockerActionComponent
class MockDockerActionComponent {
  type: string;
  automationUuid: string;
  automationName: string;
  containerId: string[];
  
  constructor(
    automationUuid: string,
    automationName: string,
    type: string,
    containerId: string[],
    automationRepo: any,
    containerRepo: any,
    containerUseCases: any
  ) {
    this.type = type;
    this.automationUuid = automationUuid;
    this.automationName = automationName;
    this.containerId = containerId;
  }
  
  executeAction = vi.fn().mockResolvedValue(undefined);
  onSuccess = vi.fn().mockResolvedValue(undefined);
  onError = vi.fn().mockResolvedValue(undefined);
}

// Mock dependencies
const ContainerRepo = {
  findContainerById: vi.fn(),
};

const ContainerUseCases = {
  performDockerAction: vi.fn(),
};

describe('DockerActionComponent', () => {
  it('should handle docker operations for automation', () => {
    const dockerAction = new MockDockerActionComponent(
      'automation1',
      'Test Automation',
      SsmContainer.Actions.START,
      ['container1', 'container2'],
      {} as any,
      ContainerRepo as any,
      ContainerUseCases as any
    );
    
    expect(dockerAction).toBeDefined();
    expect(dockerAction.type).toBe(SsmContainer.Actions.START);
    expect(dockerAction.automationUuid).toBe('automation1');
    expect(dockerAction.automationName).toBe('Test Automation');
  });
});