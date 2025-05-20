import { vi } from 'vitest';
import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as memfs from 'memfs';
import { Volume } from 'memfs';

// Create a virtual file system
const vol = Volume.fromJSON({
  '/data/config/ansible.cfg': `[defaults]
# Host key checking setting
host_key_checking=False
# Default inventory file
;inventory=/etc/ansible/hosts

[ssh_connection]
# SSH pipelining
pipelining=True
`
});

// Mock fs module
const mockFs = {
  readFileSync: vi.fn((path, encoding) => {
    try {
      return vol.readFileSync(path, encoding);
    } catch (error) {
      throw new Error('File read error');
    }
  }),
  writeFileSync: vi.fn((path, content, encoding) => {
    try {
      // Ensure the directory exists
      const dirPath = path.substring(0, path.lastIndexOf('/'));
      if (!vol.existsSync(dirPath)) {
        vol.mkdirSync(dirPath, { recursive: true });
      }
      return vol.writeFileSync(path, content, encoding);
    } catch (error) {
      throw new Error('File write error');
    }
  }),
};

// Make mockReturnValue available on the mocks
mockFs.readFileSync.mockReturnValue = function(value) {
  return this.mockImplementation(() => value);
};

mockFs.writeFileSync.mockReturnValue = function(value) {
  return this.mockImplementation(() => value);
};

vi.mock('fs', () => mockFs);

// Mock fs-extra
vi.mock('fs-extra', () => ({
  realpathSync: vi.fn((path) => {
    try {
      return vol.realpathSync(path);
    } catch (error) {
      throw error;
    }
  }),
}));

// Mock ShellWrapperService
vi.mock('@modules/shell/application/services/shell-wrapper.service', () => ({
  ShellWrapperService: vi.fn().mockImplementation(() => ({
    mkdir: vi.fn().mockImplementation((options, dir) => {
      try {
        // Create directory in our virtual filesystem
        vol.mkdirSync(dir, { recursive: true });
        return { code: 0, toString: () => 'Directory created' };
      } catch (error) {
        return { code: 1, toString: () => `Error: ${error.message}` };
      }
    }),
    rm: vi.fn().mockImplementation((options, path) => {
      try {
        if (vol.existsSync(path)) {
          if (options === '-f') {
            // Remove file
            vol.unlinkSync(path);
          } else if (options === '-rf') {
            // Remove directory recursively
            vol.rmdirSync(path, { recursive: true });
          }
        }
        return { code: 0, toString: () => 'Removed' };
      } catch (error) {
        return { code: 1, toString: () => `Error: ${error.message}` };
      }
    }),
    to: vi.fn().mockImplementation((content, path) => {
      try {
        // Ensure the directory exists
        const dirPath = path.substring(0, path.lastIndexOf('/'));
        if (!vol.existsSync(dirPath)) {
          vol.mkdirSync(dirPath, { recursive: true });
        }
        vol.writeFileSync(path, content);
        return { code: 0, toString: () => 'Written' };
      } catch (error) {
        return { code: 1, toString: () => `Error: ${error.message}` };
      }
    }),
    cp: vi.fn().mockImplementation((source, dest) => {
      try {
        if (!vol.existsSync(source)) {
          throw new Error(`Source file not found: ${source}`);
        }
        // Ensure the directory exists
        const dirPath = dest.substring(0, dest.lastIndexOf('/'));
        if (!vol.existsSync(dirPath)) {
          vol.mkdirSync(dirPath, { recursive: true });
        }
        const content = vol.readFileSync(source, 'utf-8');
        vol.writeFileSync(dest, content);
        return { code: 0, toString: () => 'Copied' };
      } catch (error) {
        return { code: 1, toString: () => `Error: ${error.message}` };
      }
    }),
    test: vi.fn().mockImplementation((options, testPath) => {
      if (options === '-f') {
        return vol.existsSync(testPath) && vol.statSync(testPath).isFile();
      } else if (options === '-d') {
        return vol.existsSync(testPath) && vol.statSync(testPath).isDirectory();
      }
      return vol.existsSync(testPath);
    }),
    cat: vi.fn().mockImplementation((path) => {
      try {
        const content = vol.readFileSync(path, 'utf-8');
        return { code: 0, toString: () => content };
      } catch (error) {
        return { code: 1, toString: () => `Error: ${error.message}` };
      }
    }),
  })),
}));

// Mock FileSystemService
vi.mock('@modules/shell/application/services/file-system.service', () => ({
  FileSystemService: vi.fn().mockImplementation(() => ({
    test: vi.fn().mockImplementation((options, testPath) => {
      if (options === '-f') {
        return vol.existsSync(testPath) && vol.statSync(testPath).isFile();
      } else if (options === '-d') {
        return vol.existsSync(testPath) && vol.statSync(testPath).isDirectory();
      }
      return vol.existsSync(testPath);
    }),
    createDirectory: vi.fn().mockImplementation((path) => {
      try {
        vol.mkdirSync(path, { recursive: true });
        return { code: 0, toString: () => 'Directory created' };
      } catch (error) {
        return { code: 1, toString: () => `Error: ${error.message}` };
      }
    }),
    copyFile: vi.fn().mockImplementation((source, dest) => {
      try {
        // In our test setup, we'll simulate copying by creating the destination file with the same content
        // We don't need to read from actual file system for source
        const defaultContent = `[defaults]
# Host key checking setting
host_key_checking=False
# Default inventory file
;inventory=/etc/ansible/hosts

[ssh_connection]
# SSH pipelining
pipelining=True
`;
        // Ensure the directory exists
        const dirPath = dest.substring(0, dest.lastIndexOf('/'));
        if (!vol.existsSync(dirPath)) {
          vol.mkdirSync(dirPath, { recursive: true });
        }
        
        vol.writeFileSync(dest, defaultContent);
        return { code: 0, toString: () => 'Copied' };
      } catch (error) {
        return { code: 1, toString: () => `Error: ${error.message}` };
      }
    }),
    readFile: vi.fn().mockImplementation((path) => {
      try {
        return vol.readFileSync(path, 'utf-8');
      } catch (error) {
        throw new Error(`File not found: ${path}`);
      }
    }),
    writeFile: vi.fn().mockImplementation((content, path) => {
      try {
        // Ensure the directory exists
        const dirPath = path.substring(0, path.lastIndexOf('/'));
        if (!vol.existsSync(dirPath)) {
          vol.mkdirSync(dirPath, { recursive: true });
        }
        vol.writeFileSync(path, content);
      } catch (error) {
        throw new Error(`Cannot write to file: ${path}`);
      }
    }),
    deleteFile: vi.fn(),
    deleteFiles: vi.fn(),
    getTempDir: vi.fn().mockReturnValue('/tmp'),
  })),
}));

// Set up the virtual file system with required directories
vol.mkdirSync('/data/config', { recursive: true });

// Create the ansible config file if it doesn't exist
if (!vol.existsSync('/data/config/ansible.cfg')) {
  vol.writeFileSync(
    '/data/config/ansible.cfg',
    `[defaults]
# Host key checking setting
host_key_checking=False
# Default inventory file
;inventory=/etc/ansible/hosts

[ssh_connection]
# SSH pipelining
pipelining=True
`
  );
}

// Mock config.ts
vi.mock('../../../../config', () => ({
  SSM_DATA_PATH: '/data',
  SSM_INSTALL_PATH: '/opt/ssm',
}));