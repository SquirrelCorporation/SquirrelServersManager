import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import Playbook from '../../../../data/database/model/Playbook';
import PlaybookRepo from '../../../../data/database/repository/PlaybookRepo';
import UserRepo from '../../../../data/database/repository/UserRepo';
import PlaybookUseCases from '../../../../use-cases/PlaybookUseCases';
import PlaybookActionComponent from '../../../../modules/automations/actions/PlaybookActionComponent';

const automationUuid = 'test-uuid';
const automationName = 'test-name';
const playbookUuid = 'playbook1';
const targets = ['target1', 'target2'];
const extraVarsForcedValues: any[] | undefined = [];

// Mocking required dependencies
vi.mock('../../../../data/database/repository/PlaybookRepo', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('../../../../data/database/repository/PlaybookRepo')>()),
    default: {
      findOneByUuid: async (uuid: string) => {
        if (uuid === 'null') {
          return null;
        }
        return { uuid: uuid } as Playbook;
      },
    },
  };
});
vi.mock('../../../../data/database/repository/UserRepo', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('../../../../data/database/repository/UserRepo')>()),
    default: {
      findFirst: async () => {
        return { id: 'user1' };
      },
    },
  };
});
vi.mock('../../../../use-cases/PlaybookUseCases', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('../../../../use-cases/PlaybookUseCases')>()),
    default: {
      executePlaybook: async (uuid: string) => {
        if (uuid === 'error') {
          throw new Error('Playbook execution failed');
        }
        return 'execId1';
      },
    },
  };
});

describe('PlaybookActionComponent', () => {
  beforeEach(async () => {
    vi.resetAllMocks();
    vi.spyOn(PlaybookRepo, 'findOneByUuid');
    vi.spyOn(UserRepo, 'findFirst');
    vi.spyOn(PlaybookUseCases, 'executePlaybook');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('executeAction successfully executes playbooks', async () => {
    const playbookActionComponent = new PlaybookActionComponent(
      automationUuid,
      automationName,
      playbookUuid,
      targets,
      extraVarsForcedValues,
    );

    const fakePlaybook = { uuid: 'playbook1' } as Playbook;
    const fakeUser = { id: 'user1' };
    playbookActionComponent.waitForResult = vi.fn();
    await playbookActionComponent.executeAction();

    expect(PlaybookRepo.findOneByUuid).toHaveBeenCalledWith(playbookUuid);
    expect(UserRepo.findFirst).toHaveBeenCalled();
    expect(playbookActionComponent.waitForResult).toHaveBeenCalled();
    expect(PlaybookUseCases.executePlaybook).toHaveBeenCalledWith(
      fakePlaybook,
      fakeUser,
      targets,
      extraVarsForcedValues,
    );
  });

  test('executeAction handles playbook not found', async () => {
    const playbookActionComponent = new PlaybookActionComponent(
      automationUuid,
      automationName,
      'null',
      targets,
      extraVarsForcedValues,
    );
    playbookActionComponent.waitForResult = vi.fn();

    // No action should be performed when playbook is not found
    await playbookActionComponent.executeAction();
    expect(playbookActionComponent.waitForResult).toHaveBeenCalledTimes(0);
    expect(PlaybookUseCases.executePlaybook).not.toBeCalled();
  });

  test('executeAction handles failed playbook execution', async () => {
    const playbookActionComponent = new PlaybookActionComponent(
      automationUuid,
      automationName,
      'error',
      targets,
      extraVarsForcedValues,
    );
    playbookActionComponent.waitForResult = vi.fn();
    expect(playbookActionComponent.waitForResult).toHaveBeenCalledTimes(0);
  });
});
