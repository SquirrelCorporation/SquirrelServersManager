import { vi } from 'vitest';
import { SsmAnsible } from 'ssm-shared-lib';

// Mock dependencies
vi.mock('@nestjs/common', () => {
  return {
    Injectable: () => vi.fn(),
    Inject: () => vi.fn(),
    Global: () => vi.fn(),
    Module: () => vi.fn(),
    forwardRef: () => vi.fn(),
  };
});

vi.mock('@modules/ansible', () => {
  return {
    ExtraVarsService: vi.fn().mockImplementation(() => ({
      findValueOfExtraVars: vi.fn().mockResolvedValue([]),
    })),
    AnsibleCommandService: vi.fn().mockImplementation(() => ({
      executePlaybookFull: vi.fn().mockResolvedValue({ taskUuid: 'task-uuid' }),
      executePlaybookOnInventory: vi.fn().mockResolvedValue({ taskUuid: 'task-uuid' }),
    })),
    TaskLogsService: vi.fn().mockImplementation(() => ({
      getTaskLogs: vi.fn().mockResolvedValue([]),
      getTaskStatuses: vi.fn().mockResolvedValue([]),
    })),
  };
});

vi.mock('@modules/shell', () => {
  return {
    SHELL_WRAPPER_SERVICE: 'SHELL_WRAPPER_SERVICE',
    IShellWrapperService: vi.fn(),
    PlaybookFileService: vi.fn().mockImplementation(() => ({
      readPlaybook: vi.fn().mockResolvedValue({ content: 'playbook content' }),
      editPlaybook: vi.fn().mockResolvedValue({ success: true }),
      testExistence: vi.fn().mockResolvedValue(true),
    })),
  };
});

vi.mock('@nestjs/cache-manager', () => {
  return {
    CACHE_MANAGER: 'CACHE_MANAGER',
  };
});

vi.mock('../../domain/repositories/playbook-repository.interface', () => {
  return {
    PLAYBOOK_REPOSITORY: 'PLAYBOOK_REPOSITORY',
    IPlaybookRepository: vi.fn(),
  };
});

vi.mock('../../../domain/entities/playbook.entity', () => {
  return {
    IPlaybook: vi.fn(),
  };
});

vi.mock('@infrastructure/exceptions/app-exceptions', () => {
  return {
    NotFoundError: class NotFoundError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
      }
    },
    BadRequestError: class BadRequestError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
      }
    },
  };
});

// Define SsmAnsible constants
export const EXECUTION_MODES = {
  APPLY: 'apply',
  CHECK: 'check',
};

export const EXTRA_VARS_TYPES = {
  MANUAL: 'manual',
  SHARED: 'shared',
  CONTEXT: 'context',
};

// Mock ssm-shared-lib
vi.mock('ssm-shared-lib', () => {
  return {
    SsmAnsible: {
      ExecutionMode: {
        APPLY: 'apply',
        CHECK: 'check',
      },
      ExtraVarsType: {
        MANUAL: 'manual',
        SHARED: 'shared',
        CONTEXT: 'context',
      },
    },
    API: {
      ExtraVar: {},
      ExtraVars: [],
    },
  };
});
