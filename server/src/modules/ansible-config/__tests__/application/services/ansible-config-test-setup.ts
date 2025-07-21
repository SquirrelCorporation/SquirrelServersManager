import { vi } from 'vitest';

// Mock test file data
const mockConfigContent = `[defaults]
# Host key checking setting
host_key_checking=False
# Default inventory file
;inventory=/etc/ansible/hosts

[ssh_connection]
# SSH pipelining
pipelining=True
`;

// Create mock services
export const mockFileSystemService = {
  test: vi.fn().mockReturnValue(true),
  createDirectory: vi.fn(),
  copyFile: vi.fn(),
};

// Create a properly stubbed fs module
export const mockFs = {
  readFileSync: vi.fn().mockImplementation(() => mockConfigContent),
  writeFileSync: vi.fn(),
};

// Create the expected parsed config object
export const parsedConfig = {
  defaults: {
    host_key_checking: {
      value: 'False',
      deactivated: false,
      description: 'Host key checking setting',
    },
    inventory: {
      value: '/etc/ansible/hosts',
      deactivated: true,
      description: 'Default inventory file',
    },
  },
  ssh_connection: {
    pipelining: {
      value: 'True',
      deactivated: false,
      description: 'SSH pipelining',
    },
  },
};

// Set up mocks for imports
vi.mock('fs', () => ({
  readFileSync: mockFs.readFileSync,
  writeFileSync: mockFs.writeFileSync,
}));

vi.mock('../../../../config', () => ({
  SSM_DATA_PATH: '/data',
  SSM_INSTALL_PATH: '/opt/ssm',
}));

vi.mock('@modules/shell/application/services/file-system.service', () => ({
  FileSystemService: vi.fn().mockImplementation(() => mockFileSystemService),
}));
