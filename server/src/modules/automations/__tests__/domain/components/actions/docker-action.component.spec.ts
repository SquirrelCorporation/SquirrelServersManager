import { SsmContainer } from 'ssm-shared-lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DockerActionComponent } from '../../../../domain/components/actions/docker-action.component';

// Mock dependencies
vi.mock('../../../../../data/database/repository/ContainerRepo', () => ({
  default: {
    findContainerById: vi.fn(),
  },
}), { virtual: true });

vi.mock('../../../../../services/ContainerUseCases', () => ({
  default: {
    performDockerAction: vi.fn(),
  },
}), { virtual: true });

vi.mock('../../../../../logger', () => ({
  default: {
    child: () => ({
      info: vi.fn(),
      error: vi.fn(),
    }),
  },
}), { virtual: true });

// Create mock objects
const ContainerRepo = {
  findContainerById: vi.fn(),
};

const ContainerUseCases = {
  performDockerAction: vi.fn(),
};

describe('DockerActionComponent', () => {
  let dockerActionComponent: DockerActionComponent;
  const mockAutomationRepo = {} as any;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('executeAction', () => {
    it('should execute docker action successfully on all containers', async () => {
      // Mock container repository
      ContainerRepo.findContainerById = vi
        .fn()
        .mockResolvedValueOnce({
          _id: 'container1',
          id: 'container1',
          name: 'container1',
        })
        .mockResolvedValueOnce({
          _id: 'container2',
          id: 'container2',
          name: 'container2',
        });

      // Mock container use cases
      ContainerUseCases.performDockerAction = vi.fn().mockResolvedValue(undefined);

      // Create component
      dockerActionComponent = new DockerActionComponent(
        'automation1',
        'Test Automation',
        SsmContainer.Actions.START,
        ['container1', 'container2'],
        mockAutomationRepo,
        ContainerRepo as any,
        ContainerUseCases as any
      );

      // Mock the onSuccess method
      const onSuccessSpy = vi.spyOn(dockerActionComponent, 'onSuccess').mockResolvedValue();

      // Execute action
      await dockerActionComponent.executeAction();

      // Verify container repo was called
      expect(ContainerRepo.findContainerById).toHaveBeenCalledTimes(2);
      expect(ContainerRepo.findContainerById).toHaveBeenCalledWith('container1');
      expect(ContainerRepo.findContainerById).toHaveBeenCalledWith('container2');

      // Verify container use cases was called
      expect(ContainerUseCases.performDockerAction).toHaveBeenCalledTimes(2);
      expect(ContainerUseCases.performDockerAction).toHaveBeenCalledWith(
        { _id: 'container1', id: 'container1', name: 'container1' },
        SsmContainer.Actions.START,
      );
      expect(ContainerUseCases.performDockerAction).toHaveBeenCalledWith(
        { _id: 'container2', id: 'container2', name: 'container2' },
        SsmContainer.Actions.START,
      );

      // Verify onSuccess was called
      expect(onSuccessSpy).toHaveBeenCalledTimes(1);
    });

    it('should handle container not found', async () => {
      // Mock container repository
      ContainerRepo.findContainerById = vi.fn().mockResolvedValueOnce(null);

      // Mock container use cases
      ContainerUseCases.performDockerAction = vi.fn().mockResolvedValue(undefined);

      // Create component
      dockerActionComponent = new DockerActionComponent(
        'automation1',
        'Test Automation',
        SsmContainer.Actions.START,
        ['container1'],
        mockAutomationRepo,
        ContainerRepo as any,
        ContainerUseCases as any
      );

      // Mock the onError method
      const onErrorSpy = vi.spyOn(dockerActionComponent, 'onError').mockResolvedValue();

      // Execute action
      await dockerActionComponent.executeAction();

      // Verify container repo was called
      expect(ContainerRepo.findContainerById).toHaveBeenCalledTimes(1);
      expect(ContainerRepo.findContainerById).toHaveBeenCalledWith('container1');

      // Verify container use cases was not called
      expect(ContainerUseCases.performDockerAction).not.toHaveBeenCalled();

      // Verify onError was called
      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      expect(onErrorSpy).toHaveBeenCalledWith(
        'Failed to execute docker action on one or more containers',
      );
    });

    it('should handle error during docker action execution', async () => {
      // Mock container repository
      ContainerRepo.findContainerById = vi.fn().mockResolvedValueOnce({
        _id: 'container1',
        id: 'container1',
        name: 'container1',
      });

      // Mock container use cases throwing error
      ContainerUseCases.performDockerAction = vi
        .fn()
        .mockRejectedValueOnce(new Error('Docker error'));

      // Create component
      dockerActionComponent = new DockerActionComponent(
        'automation1',
        'Test Automation',
        SsmContainer.Actions.START,
        ['container1'],
        mockAutomationRepo,
        ContainerRepo as any,
        ContainerUseCases as any
      );

      // Mock the onError method
      const onErrorSpy = vi.spyOn(dockerActionComponent, 'onError').mockResolvedValue();

      // Execute action
      await dockerActionComponent.executeAction();

      // Verify container repo was called
      expect(ContainerRepo.findContainerById).toHaveBeenCalledTimes(1);
      expect(ContainerRepo.findContainerById).toHaveBeenCalledWith('container1');

      // Verify container use cases was called
      expect(ContainerUseCases.performDockerAction).toHaveBeenCalledTimes(1);

      // Verify onError was called
      expect(onErrorSpy).toHaveBeenCalledTimes(1);
      expect(onErrorSpy).toHaveBeenCalledWith(
        'Failed to execute docker action on one or more containers',
      );
    });
  });
});
