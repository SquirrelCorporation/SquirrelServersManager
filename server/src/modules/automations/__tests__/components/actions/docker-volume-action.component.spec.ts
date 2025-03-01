import { Automations, SsmContainer } from 'ssm-shared-lib';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import AutomationRepo from '../../../../../data/database/repository/AutomationRepo';
import ContainerVolumeRepo from '../../../../../data/database/repository/ContainerVolumeRepo';
import ContainerVolumeUseCases from '../../../../../services/ContainerVolumeUseCases';
import { DockerVolumeActionComponent } from '../../../components/actions/docker-volume-action.component';

// Mock dependencies
vi.mock('../../../../../logger', () => ({
  default: {
    child: () => ({
      info: vi.fn(),
      error: vi.fn(),
      warn: vi.fn(),
    }),
  },
}));

vi.mock('../../../../../data/database/repository/ContainerVolumeRepo', () => ({
  default: {
    findByUuid: vi.fn(),
  },
}));

vi.mock('../../../../../data/database/repository/AutomationRepo', () => ({
  default: {
    findByUuid: vi.fn(),
    setLastExecutionStatus: vi.fn(),
  },
}));

vi.mock('../../../../../services/ContainerVolumeUseCases', () => ({
  default: {
    backupVolume: vi.fn(),
  },
}));

describe('DockerVolumeActionComponent', () => {
  let component: DockerVolumeActionComponent;
  const mockAutomationUuid = 'test-automation-uuid';
  const mockAutomationName = 'Test Automation';
  const mockVolumeUuids = ['volume-uuid-1', 'volume-uuid-2'];
  const mockDockerVolumeAction = SsmContainer.VolumeActions.BACKUP;

  const mockVolume = {
    uuid: 'volume-uuid-1',
    name: 'test-volume',
  };

  const mockAutomation = {
    uuid: mockAutomationUuid,
    name: mockAutomationName,
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Setup default mocks
    vi.mocked(ContainerVolumeRepo.findByUuid).mockResolvedValue(mockVolume as any);
    vi.mocked(ContainerVolumeUseCases.backupVolume).mockResolvedValue(undefined);
    vi.mocked(AutomationRepo.findByUuid).mockResolvedValue(mockAutomation as any);
    vi.mocked(AutomationRepo.setLastExecutionStatus).mockResolvedValue(undefined);

    // Create component
    component = new DockerVolumeActionComponent(
      mockAutomationUuid,
      mockAutomationName,
      mockDockerVolumeAction,
      mockVolumeUuids,
    );

    // Spy on component methods
    vi.spyOn(component, 'onSuccess').mockImplementation(async () => {});
    vi.spyOn(component, 'onError').mockImplementation(async () => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should initialize with correct properties', () => {
    expect(component.type).toBe(Automations.Actions.DOCKER_VOLUME);
    expect(component.dockerVolumeAction).toBe(mockDockerVolumeAction);
    expect(component.volumeUuids).toEqual(mockVolumeUuids);
    expect(component.automationUuid).toBe(mockAutomationUuid);
  });

  it('should throw error if initialized with undefined dockerVolumeAction', () => {
    expect(
      () =>
        new DockerVolumeActionComponent(
          mockAutomationUuid,
          mockAutomationName,
          undefined as any,
          mockVolumeUuids,
        ),
    ).toThrow('Empty parameters');
  });

  it('should throw error if initialized with null volumeUuids', () => {
    expect(
      () =>
        new DockerVolumeActionComponent(
          mockAutomationUuid,
          mockAutomationName,
          mockDockerVolumeAction,
          null as any,
        ),
    ).toThrow('Empty parameters');
  });

  describe('executeAction', () => {
    it('should execute backup action successfully for all volumes', async () => {
      // Mock finding different volumes for each call
      vi.mocked(ContainerVolumeRepo.findByUuid)
        .mockResolvedValueOnce({ ...mockVolume, uuid: 'volume-uuid-1' } as any)
        .mockResolvedValueOnce({ ...mockVolume, uuid: 'volume-uuid-2' } as any);

      await component.executeAction();

      expect(ContainerVolumeRepo.findByUuid).toHaveBeenCalledTimes(2);
      expect(ContainerVolumeRepo.findByUuid).toHaveBeenCalledWith('volume-uuid-1');
      expect(ContainerVolumeRepo.findByUuid).toHaveBeenCalledWith('volume-uuid-2');

      expect(ContainerVolumeUseCases.backupVolume).toHaveBeenCalledTimes(2);
      expect(ContainerVolumeUseCases.backupVolume).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: 'volume-uuid-1' }),
        SsmContainer.VolumeBackupMode.FILE_SYSTEM,
      );
      expect(ContainerVolumeUseCases.backupVolume).toHaveBeenCalledWith(
        expect.objectContaining({ uuid: 'volume-uuid-2' }),
        SsmContainer.VolumeBackupMode.FILE_SYSTEM,
      );

      expect(component.onSuccess).toHaveBeenCalledTimes(1);
      expect(component.onError).not.toHaveBeenCalled();
    });

    it('should handle volume not found', async () => {
      vi.mocked(ContainerVolumeRepo.findByUuid)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockVolume as any);

      await component.executeAction();

      expect(ContainerVolumeRepo.findByUuid).toHaveBeenCalledTimes(2);
      expect(ContainerVolumeUseCases.backupVolume).toHaveBeenCalledTimes(1);
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).toHaveBeenCalledWith('Failed to perform docker volume action');
    });

    it('should handle backup error', async () => {
      const mockError = new Error('Backup failed');
      vi.mocked(ContainerVolumeUseCases.backupVolume)
        .mockRejectedValueOnce(mockError)
        .mockResolvedValueOnce(undefined); // Second call succeeds

      await component.executeAction();

      expect(ContainerVolumeRepo.findByUuid).toHaveBeenCalledTimes(2);
      expect(ContainerVolumeUseCases.backupVolume).toHaveBeenCalledTimes(2);
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).toHaveBeenCalledWith('Failed to perform docker volume action');
    });

    it('should handle unsupported docker volume action', async () => {
      // Create component with unsupported action
      component = new DockerVolumeActionComponent(
        mockAutomationUuid,
        mockAutomationName,
        'UNSUPPORTED' as SsmContainer.VolumeActions,
        mockVolumeUuids,
      );

      // Spy on component methods
      vi.spyOn(component, 'onSuccess').mockImplementation(async () => {});
      vi.spyOn(component, 'onError').mockImplementation(async () => {});

      await component.executeAction();

      expect(ContainerVolumeRepo.findByUuid).toHaveBeenCalledTimes(2);
      expect(ContainerVolumeUseCases.backupVolume).not.toHaveBeenCalled();
      expect(component.onSuccess).not.toHaveBeenCalled();
      expect(component.onError).toHaveBeenCalledWith('Failed to perform docker volume action');
    });
  });
});
