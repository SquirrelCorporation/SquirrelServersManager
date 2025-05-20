import { vi } from 'vitest';

// Export the ExecutionMode enum that's commonly used in tests
export const ExecutionMode = {
  CHECK: 'check',
  CHECK_AND_DIFF: 'check_and_diff',
  APPLY: 'apply'
};

// Mock common modules
vi.mock('@nestjs/event-emitter', () => {
  return {
    EventEmitter2: class MockEventEmitter {
      emit = vi.fn();
      on = vi.fn();
      once = vi.fn();
      removeListener = vi.fn();
    }
  };
});

vi.mock('@nestjs/common', async () => {
  const actual = await vi.importActual('@nestjs/common');
  return {
    ...actual,
    Injectable: () => (target: any) => target,
    Inject: () => () => undefined,
    Logger: class MockLogger {
      log = vi.fn();
      error = vi.fn();
      warn = vi.fn();
      debug = vi.fn();
      verbose = vi.fn();
    }
  };
});

// Mock file system operations
vi.mock('fs', () => {
  return {
    promises: {
      readFile: vi.fn().mockResolvedValue('{"test": "data"}'),
      writeFile: vi.fn().mockResolvedValue(undefined),
      mkdir: vi.fn().mockResolvedValue(undefined),
      readdir: vi.fn().mockResolvedValue(['file1.yml', 'file2.yml']),
      stat: vi.fn().mockResolvedValue({ isDirectory: () => true })
    },
    existsSync: vi.fn().mockReturnValue(true),
    readFileSync: vi.fn().mockReturnValue('{"test": "data"}')
  };
});

// Mock ansible module services
vi.mock('@modules/ansible/application/services/inventory-transformer.service', () => {
  return {
    InventoryTransformerService: class MockInventoryTransformerService {
      transformInventory = vi.fn().mockReturnValue({});
    }
  };
});

// Mock extra-vars-transformer service
vi.mock('@modules/ansible/application/services/extra-vars-transformer.service', () => {
  return {
    ExtraVarsTransformerService: class MockExtraVarsTransformerService {
      transformExtraVars = vi.fn().mockReturnValue({ foo: 'bar' });
      mapExtraVarToPair = vi.fn().mockReturnValue({ key: 'foo', value: 'bar' });
    }
  };
});

// Mock ansible command service
vi.mock('@modules/ansible/application/services/ansible-command.service', () => {
  return {
    AnsibleCommandService: class MockAnsibleCommandService {
      executeCommand = vi.fn().mockResolvedValue('command executed');
      executeAnsibleCommand = vi.fn().mockResolvedValue('ansible command executed');
      executePlaybookCommand = vi.fn().mockResolvedValue('playbook executed');
      getAnsibleVersion = vi.fn().mockResolvedValue('2.9.0');
    }
  };
});

// Mock ansible task repository
vi.mock('@modules/ansible/infrastructure/repositories/ansible-task.repository', () => {
  return {
    AnsibleTaskRepository: class MockAnsibleTaskRepository {
      create = vi.fn().mockResolvedValue({ id: 'test-task-id' });
      findAll = vi.fn().mockResolvedValue([{ id: 'test-task-id' }]);
      findOne = vi.fn().mockResolvedValue({ id: 'test-task-id' });
      updateOne = vi.fn().mockResolvedValue({ id: 'test-task-id' });
      deleteOne = vi.fn().mockResolvedValue({ deleted: true });
    }
  };
});

// Mock shell module services
vi.mock('@modules/shell/application/services/shell-wrapper.service', () => {
  return {
    ShellWrapperService: class MockShellWrapperService {
      execute = vi.fn().mockResolvedValue({ code: 0, stdout: 'success', stderr: '' });
    }
  };
});

// Mock the ansible command builder service
vi.mock('@modules/ansible/application/services/ansible-command-builder.service', () => {
  return {
    AnsibleCommandBuilderService: class MockAnsibleCommandBuilderService {
      sanitizeInventory = vi.fn().mockReturnValue("'sanitized-inventory'");
      getInventoryTargets = vi.fn().mockReturnValue('--specific-host mock-inventory');
      getLogLevel = vi.fn().mockReturnValue('--log-level 1');
      getExtraVars = vi.fn().mockReturnValue('--extra-vars \'{"foo":"bar"}\'');
      getDryRun = vi.fn().mockReturnValue('--check');
      getVaults = vi.fn().mockReturnValue('--vault-id test@client');
      buildAnsibleCmd = vi.fn().mockReturnValue('ansible-playbook mock-command');
    }
  };
});