import * as os from 'node:os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fs, vol } from 'memfs';
import { DEFAULT_VAULT_ID, vaultDecrypt } from '../../../../../modules/ansible-vault/ansible-vault';
import shellWrapper from '../../../../../modules/shell/ShellWrapper';
import FileSystemManager from '../../../../../modules/shell/managers/FileSystemManager';
import SshPrivateKeyFileManager from '../../../../../modules/shell/managers/SshPrivateKeyFileManager';

// Mock necessary modules and methods
vi.mock('node:fs');
vi.mock('node:fs/promises');
vi.mock('node:os');
vi.mock('path');
vi.mock('./../../../../modules/shell/ShellWrapper');
vi.mock('../../../../../modules/shell/managers/FileSystemManager');
vi.mock('../../../../../modules/ansible-vault/ansible-vault');

describe('SshPrivateKeyFileManager', () => {
  const execUuid = 'execUuid';
  const deviceUuid = 'deviceUuid';
  const sskVaultedKey = 'vaultedKey';
  const decryptedContent = 'decryptedContent';

  beforeEach(() => {
    vol.reset(); // Reset memfs before each test
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('getTmpKeyFileName', () => {
    it('should generate the correct temporary key file name', () => {
      const fileName = SshPrivateKeyFileManager.getTmpKeyFileName(execUuid, deviceUuid);
      expect(fileName).toBe(`${execUuid}_${deviceUuid}`);
    });
  });

  describe('getTmpKeyFilePath', () => {
    it('should generate the correct temporary key file path', () => {
      const tmpdir = '/tmp';
      (os.tmpdir as any).mockReturnValue(tmpdir);
      path.join = vi.fn((...args) => args.join('/'));

      const fileName = `${execUuid}_${deviceUuid}`;
      const filePath = SshPrivateKeyFileManager.getTmpKeyFilePath(fileName);

      expect(filePath).toBe(`${tmpdir}/${fileName}_dec.key`);
      expect(path.join).toHaveBeenCalledWith(tmpdir, `${fileName}_dec.key`);
    });
  });

  describe('genAnsibleTemporaryPrivateKey', () => {
    it('should create a temporary private key file and chmod it', async () => {
      (vaultDecrypt as any).mockResolvedValue(decryptedContent);
      vol.fromJSON(
        {
          './dir1/hw.txt': 'hello dir1',
          './dir2/hw.txt': 'hello dir2',
        },
        // default cwd
        '/tmp',
      );
      FileSystemManager.writeFile = vi.fn((content, filePath) => {
        fs.writeFileSync(filePath, content); // Use memfs to simulate writing file
      });
      shellWrapper.chmod = vi.fn().mockReturnValue({ code: 0 });

      const tmpKeyFilePath = await SshPrivateKeyFileManager.genAnsibleTemporaryPrivateKey(
        sskVaultedKey,
        deviceUuid,
        execUuid,
      );

      expect(vaultDecrypt).toHaveBeenCalledWith(sskVaultedKey, DEFAULT_VAULT_ID);
      expect(FileSystemManager.writeFile).toHaveBeenCalledWith(
        decryptedContent as string,
        tmpKeyFilePath,
      );
      expect(shellWrapper.chmod).toHaveBeenCalledWith('600', tmpKeyFilePath);
      expect(fs.readFileSync(tmpKeyFilePath, 'utf8')).toBe(decryptedContent); // Verify file content in memfs
      expect(tmpKeyFilePath).toBe(`${os.tmpdir()}/${execUuid}_${deviceUuid}_dec.key`);
    });

    it('should throw an error if chmod command fails', async () => {
      (vaultDecrypt as any).mockResolvedValue(decryptedContent);
      vol.fromJSON(
        {
          './dir1/hw.txt': 'hello dir1',
          './dir2/hw.txt': 'hello dir2',
        },
        // default cwd
        '/tmp',
      );
      FileSystemManager.writeFile = vi.fn((content, filePath) => {
        fs.writeFileSync(filePath, content); // Use memfs to simulate writing file
      });
      shellWrapper.chmod = vi.fn().mockReturnValue({ code: 1 });

      await expect(
        SshPrivateKeyFileManager.genAnsibleTemporaryPrivateKey(sskVaultedKey, deviceUuid, execUuid),
      ).rejects.toThrow(
        `genAnsibleTemporaryPrivateKey - Error chmoding file ${os.tmpdir()}/${execUuid}_${deviceUuid}_dec.key`,
      );
    });
  });

  describe('removeAnsibleTemporaryPrivateKey', () => {
    it('should remove the temporary key file if it exists', () => {
      vol.fromJSON(
        {
          './dir1/hw.txt': 'hello dir1',
          './dir2/hw.txt': 'hello dir2',
        },
        // default cwd
        '/tmp',
      );
      const tmpKeyFilePath = `${os.tmpdir()}/${execUuid}_${deviceUuid}_dec.key`;
      fs.writeFileSync(tmpKeyFilePath, ''); // Create an empty file in memfs

      FileSystemManager.test = vi.fn((flag, filePath) => fs.existsSync(filePath));
      FileSystemManager.deleteFile = vi.fn((filePath) => fs.unlinkSync(filePath));

      SshPrivateKeyFileManager.removeAnsibleTemporaryPrivateKey(deviceUuid, execUuid);

      expect(FileSystemManager.test).toHaveBeenCalledWith('-f', tmpKeyFilePath);
      expect(FileSystemManager.deleteFile).toHaveBeenCalledWith(tmpKeyFilePath);
      expect(fs.existsSync(tmpKeyFilePath)).toBe(false); // Verify file has been deleted in memfs
    });

    it('should warn if the temporary key file does not exist', () => {
      const mockLogger = {
        warn: vi.fn(),
      };
      (SshPrivateKeyFileManager as any).logger = mockLogger;

      FileSystemManager.test = vi.fn().mockReturnValue(false);

      SshPrivateKeyFileManager.removeAnsibleTemporaryPrivateKey(deviceUuid, execUuid);

      const tmpKeyFilePath = `${os.tmpdir()}/${execUuid}_${deviceUuid}_dec.key`;

      expect(FileSystemManager.test).toHaveBeenCalledWith('-f', tmpKeyFilePath);
      expect(mockLogger.warn).toHaveBeenCalledWith(
        `remoteAnsibleTemporaryPrivateKey - File not found (${tmpKeyFilePath})`,
      );
    });
  });

  describe('removeAllAnsibleExecTemporaryPrivateKeys', () => {
    it('should remove all temporary private keys for a specific execUuid', () => {
      FileSystemManager.deleteFile = vi.fn();

      const fileName = `${execUuid}_*`;
      const tmpKeyFilePath = `${os.tmpdir()}/${fileName}_dec.key`;

      SshPrivateKeyFileManager.removeAllAnsibleExecTemporaryPrivateKeys(execUuid);

      expect(FileSystemManager.deleteFile).toHaveBeenCalledWith(tmpKeyFilePath);
    });
  });

  describe('removeAllAnsibleTemporaryPrivateKeys', () => {
    it('should remove all temporary private keys', () => {
      FileSystemManager.deleteFile = vi.fn();

      const tmpKeyFilePath = `${os.tmpdir()}/*_dec.key`;

      SshPrivateKeyFileManager.removeAllAnsibleTemporaryPrivateKeys();

      expect(FileSystemManager.deleteFile).toHaveBeenCalledWith(tmpKeyFilePath);
    });
  });
});
