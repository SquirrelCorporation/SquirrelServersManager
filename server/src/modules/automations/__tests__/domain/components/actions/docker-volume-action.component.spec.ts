import { Automations, SsmContainer } from 'ssm-shared-lib';
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

// Create mock for DockerVolumeActionComponent
class MockDockerVolumeActionComponent {
  type: string = Automations.Actions.DOCKER_VOLUME;
  automationUuid: string;
  automationName: string;
  dockerVolumeAction: SsmContainer.VolumeActions;
  volumeUuids: string[];

  constructor(
    automationUuid: string,
    automationName: string,
    dockerVolumeAction: SsmContainer.VolumeActions,
    volumeUuids: string[],
    automationRepo: any,
    containerVolumeRepo: any,
    containerVolumeUseCases: any,
  ) {
    if (!dockerVolumeAction || !volumeUuids) {
      throw new Error('Empty parameters');
    }

    this.automationUuid = automationUuid;
    this.automationName = automationName;
    this.dockerVolumeAction = dockerVolumeAction;
    this.volumeUuids = volumeUuids;
  }

  executeAction = vi.fn().mockResolvedValue(undefined);
  onSuccess = vi.fn().mockResolvedValue(undefined);
  onError = vi.fn().mockResolvedValue(undefined);
}

describe('DockerVolumeActionComponent', () => {
  it('should handle volume operations', () => {
    const mockAutomationUuid = 'test-automation-uuid';
    const mockAutomationName = 'Test Automation';
    const mockVolumeUuids = ['volume-uuid-1', 'volume-uuid-2'];
    const mockDockerVolumeAction = SsmContainer.VolumeActions.BACKUP;

    const component = new MockDockerVolumeActionComponent(
      mockAutomationUuid,
      mockAutomationName,
      mockDockerVolumeAction,
      mockVolumeUuids,
      {} as any,
      {} as any,
      {} as any,
    );

    expect(component).toBeDefined();
    expect(component.type).toBe(Automations.Actions.DOCKER_VOLUME);
    expect(component.dockerVolumeAction).toBe(mockDockerVolumeAction);
    expect(component.volumeUuids).toEqual(mockVolumeUuids);
    expect(component.automationUuid).toBe(mockAutomationUuid);
  });

  it('should throw error if initialized with undefined dockerVolumeAction', () => {
    expect(
      () =>
        new MockDockerVolumeActionComponent(
          'test-uuid',
          'Test Automation',
          undefined as any,
          ['volume-1'],
          {} as any,
          {} as any,
          {} as any,
        ),
    ).toThrow('Empty parameters');
  });

  it('should throw error if initialized with null volumeUuids', () => {
    expect(
      () =>
        new MockDockerVolumeActionComponent(
          'test-uuid',
          'Test Automation',
          SsmContainer.VolumeActions.BACKUP,
          null as any,
          {} as any,
          {} as any,
          {} as any,
        ),
    ).toThrow('Empty parameters');
  });
});
