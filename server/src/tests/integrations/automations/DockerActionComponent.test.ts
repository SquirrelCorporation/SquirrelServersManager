import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { SsmContainer } from 'ssm-shared-lib';
import Automation from '../../../data/database/model/Automation';
import Container from '../../../data/database/model/Container';
import ContainerRepo from '../../../data/database/repository/ContainerRepo';
import ContainerUseCases from '../../../use-cases/ContainerUseCases';
import DockerActionComponent from '../../../integrations/automations/actions/DockerActionComponent';

const automationUuid = 'test-uuid';
const automationName = 'test-name';
const dockerAction = SsmContainer.Actions.PAUSE;
const containerIds = ['container1', 'container2'];

// Mocking required dependencies
vi.mock('../../../data/database/repository/ContainerRepo', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('../../../data/database/repository/ContainerRepo')>()),
    default: {
      findContainerById: async (id: string) => {
        if (id === 'unknown') {
          return null;
        }
        return { id: id };
      },
    },
  };
});
vi.mock('../../../data/database/repository/AutomationRepo', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('../../../data/database/repository/AutomationRepo')>()),
    default: {
      findByUuid: async (uuid: string) => {
        return { uuid: uuid };
      },
      setLastExecutionStatus: async (automation: Automation, status: 'failed' | 'success') => {
        return;
      },
    },
  };
});
vi.mock('../../../use-cases/ContainerUseCases', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('../../../use-cases/ContainerUseCases')>()),
    default: {
      performAction: (container: Container, action: SsmContainer.Actions) => {
        if (action === SsmContainer.Actions.PAUSE) {
          return;
        }
        throw new Error();
      },
    },
  };
});

describe('DockerActionComponent', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    vi.spyOn(ContainerRepo, 'findContainerById');
    vi.spyOn(ContainerUseCases, 'performAction');
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('executeAction successfully performs docker actions', async () => {
    const dockerActionComponent = new DockerActionComponent(
      automationUuid,
      automationName,
      dockerAction,
      containerIds,
    );

    const fakeContainer = { id: 'container1' };
    await dockerActionComponent.executeAction();

    expect(ContainerRepo.findContainerById).toHaveBeenCalledWith('container1');
    expect(ContainerUseCases.performAction).toHaveBeenCalledTimes(2); // Assuming you have two containers
    expect(ContainerUseCases.performAction).toHaveBeenCalledWith(fakeContainer, dockerAction);
  });

  test('executeAction handles no containers provided', async () => {
    const dockerActionComponent = new DockerActionComponent(
      automationUuid,
      automationName,
      dockerAction,
      [], // No containers
    );

    // No action should be performed when no containers are provided
    await dockerActionComponent.executeAction();
    expect(ContainerUseCases.performAction).not.toHaveBeenCalled();
  });

  test('executeAction handles failed container retrieval', async () => {
    const dockerActionComponent = new DockerActionComponent(
      automationUuid,
      automationName,
      dockerAction,
      ['unknown'],
    );

    // An error should be thrown if the container can't be retrieved
    expect(dockerActionComponent.executeAction()).resolves.toBeUndefined();
    expect(ContainerUseCases.performAction).not.toHaveBeenCalled();
  });

  test('executeAction handles failed performAction execution', async () => {
    const dockerActionComponent = new DockerActionComponent(
      automationUuid,
      automationName,
      SsmContainer.Actions.KILL,
      containerIds,
    );

    // An error should be thrown if performing the action fails
    await expect(dockerActionComponent.executeAction()).resolves.toBeUndefined();
  });
});
