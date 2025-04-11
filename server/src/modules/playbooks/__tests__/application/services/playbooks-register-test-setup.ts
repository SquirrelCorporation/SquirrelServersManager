import { vi } from 'vitest';

// Mock dependencies
vi.mock('@infrastructure/exceptions/app-exceptions', () => {
  return {
    EntityNotFoundException: class NotFoundError extends Error {
      constructor(entityName: string, id: string) {
        super(`Entity ${entityName} with ID ${id} not found`);
        this.name = 'NotFoundError';
      }
    },
    ForbiddenException: class ForbiddenError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'ForbiddenError';
      }
    },
    InternalServerException: class InternalError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'InternalError';
      }
    },
    BadRequestException: class BadRequestError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'BadRequestError';
      }
    },
    NotFoundException: class NotFoundError extends Error {
      constructor(message: string) {
        super(message);
        this.name = 'NotFoundError';
      }
    }
  };
});

vi.mock('@modules/shell', () => {
  return {
    FileSystemService: vi.fn().mockImplementation(() => ({
      createDirectory: vi.fn().mockResolvedValue({}),
      writeFile: vi.fn().mockResolvedValue({}),
      deleteFiles: vi.fn().mockResolvedValue({}),
    })),
    PlaybookFileService: vi.fn().mockImplementation(() => ({
      newPlaybook: vi.fn().mockResolvedValue({}),
      deletePlaybook: vi.fn().mockResolvedValue({}),
    }))
  };
});

// Mock NestJS dependencies
vi.mock('@nestjs/common', () => {
  return {
    Injectable: () => vi.fn(),
    Inject: () => vi.fn(),
    Logger: vi.fn().mockImplementation(() => ({
      log: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  };
});

// Mock the tree-utils module
vi.mock('../../../utils/tree-utils', () => ({
  recursiveTreeCompletion: vi.fn().mockImplementation((tree) => {
    return Promise.resolve(tree ? tree : []);
  }),
}));

// Mock domain repositories
vi.mock('@modules/playbooks/domain/repositories/playbook-repository.interface', () => {
  return {
    PLAYBOOK_REPOSITORY: 'PLAYBOOK_REPOSITORY',
    IPlaybookRepository: vi.fn(),
  };
});

vi.mock('@modules/playbooks/domain/repositories/playbooks-register-repository.interface', () => {
  return {
    PLAYBOOKS_REGISTER_REPOSITORY: 'PLAYBOOKS_REGISTER_REPOSITORY',
    IPlaybooksRegisterRepository: vi.fn(),
  };
});

// Mock domain entities
vi.mock('@modules/playbooks/domain/entities/playbooks-register.entity', () => {
  return {
    IPlaybooksRegister: vi.fn(),
  };
});