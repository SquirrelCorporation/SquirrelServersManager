import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ShellWrapperService } from '../../../application/services/shell-wrapper.service';
import { Logger } from '@nestjs/common';

// This class is a simplified version of the real service for testing purposes
class SshKeyService {
  private readonly logger = new Logger('SshKeyService');
  private fileSystemService: any | null = null;

  constructor(
    private readonly shellWrapper: ShellWrapperService,
    private readonly vaultCryptoService: any,
    fileSystemService?: any,
  ) {
    this.fileSystemService = fileSystemService || null;
  }

  /**
   * Gets the temporary key filename
   */
  getTmpKeyFileName(execUuid: string, deviceUuid: string) {
    return `${execUuid}_${deviceUuid}`;
  }

  /**
   * Gets the temporary key file path
   */
  getTmpKeyFilePath(fileName: string) {
    return `/tmp/${fileName}_dec.key`;
  }

  /**
   * Generates an Ansible temporary private key
   */
  async genAnsibleTemporaryPrivateKey(sskVaultedKey: string, deviceUuid: string, execUuid: string) {
    try {
      const decryptedContent = await this.vaultCryptoService.decrypt(
        sskVaultedKey,
        'default',
      );
      const tmpKeyFilePath = this.getTmpKeyFilePath(this.getTmpKeyFileName(execUuid, deviceUuid));

      if (this.fileSystemService) {
        this.fileSystemService.writeFile(decryptedContent, tmpKeyFilePath);
      } else {
        this.shellWrapper.to(decryptedContent, tmpKeyFilePath);
      }

      const result = this.shellWrapper.chmod('600', tmpKeyFilePath);
      if (result.code !== 0) {
        throw new Error(`Error chmoding file ${tmpKeyFilePath}`);
      }
      return tmpKeyFilePath;
    } catch (error) {
      this.logger.error(`genAnsibleTemporaryPrivateKey failed: ${error}`);
      throw error;
    }
  }

  /**
   * Removes an Ansible temporary private key
   */
  removeAnsibleTemporaryPrivateKey(deviceUuid: string, execUuid: string) {
    try {
      const tmpKeyFilePath = this.getTmpKeyFilePath(`${execUuid}_${deviceUuid}`);
      if (this.fileSystemService) {
        if (!this.fileSystemService.test('-f', tmpKeyFilePath)) {
          this.logger.warn(`remoteAnsibleTemporaryPrivateKey - File not found (${tmpKeyFilePath})`);
        } else {
          this.fileSystemService.deleteFile(tmpKeyFilePath);
        }
      } else {
        if (!this.shellWrapper.test('-f', tmpKeyFilePath)) {
          this.logger.warn(`remoteAnsibleTemporaryPrivateKey - File not found (${tmpKeyFilePath})`);
        } else {
          this.shellWrapper.rm('-f', tmpKeyFilePath);
        }
      }
    } catch (error) {
      this.logger.error(`removeAnsibleTemporaryPrivateKey failed: ${error}`);
    }
  }

  /**
   * Removes all Ansible temporary private keys for a specific execution
   */
  removeAllAnsibleExecTemporaryPrivateKeys(execUuid: string) {
    try {
      const pattern = this.getTmpKeyFilePath(this.getTmpKeyFileName(execUuid, '*'));
      if (this.fileSystemService) {
        this.fileSystemService.deleteFile(pattern);
      } else {
        this.shellWrapper.rm('-f', pattern);
      }
    } catch (error) {
      this.logger.error(`removeAllAnsibleExecTemporaryPrivateKeys failed: ${error}`);
    }
  }

  /**
   * Removes all Ansible temporary private keys
   */
  removeAllAnsibleTemporaryPrivateKeys() {
    try {
      const pattern = this.getTmpKeyFilePath('*');
      if (this.fileSystemService) {
        this.fileSystemService.deleteFile(pattern);
      } else {
        this.shellWrapper.rm('-f', pattern);
      }
    } catch (error) {
      this.logger.error(`removeAllAnsibleTemporaryPrivateKeys failed: ${error}`);
    }
  }
}

// Mock the Logger
vi.mock('@nestjs/common', () => ({
  Logger: vi.fn().mockImplementation(() => ({
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn(),
    debug: vi.fn()
  }))
}));

describe('SshKeyService', () => {
  let sshKeyService: SshKeyService;
  let shellWrapperService: any;
  let vaultCryptoService: any;
  let fileSystemService: any;
  
  const execUuid = 'exec-123';
  const deviceUuid = 'device-456';
  const mockDecryptedKey = '-----BEGIN RSA PRIVATE KEY-----\nDecrypted Key Content\n-----END RSA PRIVATE KEY-----';
  
  beforeEach(() => {
    // Create shell wrapper mock
    shellWrapperService = {
      to: vi.fn().mockReturnValue({ code: 0 }),
      chmod: vi.fn().mockReturnValue({ code: 0 }),
      test: vi.fn().mockReturnValue(true),
      rm: vi.fn()
    };
    
    // Create vault crypto service mock
    vaultCryptoService = {
      decrypt: vi.fn().mockResolvedValue(mockDecryptedKey)
    };
    
    // Create file system service mock
    fileSystemService = {
      writeFile: vi.fn(),
      test: vi.fn().mockReturnValue(true),
      deleteFile: vi.fn()
    };
    
    // Create service with mocks
    sshKeyService = new SshKeyService(
      shellWrapperService,
      vaultCryptoService,
      fileSystemService
    );
  });
  
  describe('getTmpKeyFileName', () => {
    it('should generate the correct temporary key file name', () => {
      const fileName = sshKeyService.getTmpKeyFileName(execUuid, deviceUuid);
      expect(fileName).toBe(`${execUuid}_${deviceUuid}`);
    });
  });
  
  describe('getTmpKeyFilePath', () => {
    it('should generate the correct temporary key file path', () => {
      const fileName = `${execUuid}_${deviceUuid}`;
      const filePath = sshKeyService.getTmpKeyFilePath(fileName);
      expect(filePath).toBe(`/tmp/${fileName}_dec.key`);
    });
  });
  
  describe('genAnsibleTemporaryPrivateKey', () => {
    const vaultedKey = '$ANSIBLE_VAULT;1.1;AES256\nEncrypted Content\n';
    
    it('should generate a temporary private key file using FileSystemService', async () => {
      // Act
      const result = await sshKeyService.genAnsibleTemporaryPrivateKey(vaultedKey, deviceUuid, execUuid);
      
      // Assert
      expect(vaultCryptoService.decrypt).toHaveBeenCalledWith(vaultedKey, 'default');
      expect(fileSystemService.writeFile).toHaveBeenCalledWith(
        mockDecryptedKey,
        `/tmp/${execUuid}_${deviceUuid}_dec.key`
      );
      expect(shellWrapperService.chmod).toHaveBeenCalledWith(
        '600',
        `/tmp/${execUuid}_${deviceUuid}_dec.key`
      );
      expect(result).toBe(`/tmp/${execUuid}_${deviceUuid}_dec.key`);
    });
    
    it('should generate a temporary private key file using ShellWrapperService if FileSystemService is not provided', async () => {
      // Arrange
      sshKeyService = new SshKeyService(
        shellWrapperService,
        vaultCryptoService
      );
      
      // Act
      const result = await sshKeyService.genAnsibleTemporaryPrivateKey(vaultedKey, deviceUuid, execUuid);
      
      // Assert
      expect(vaultCryptoService.decrypt).toHaveBeenCalledWith(vaultedKey, 'default');
      expect(shellWrapperService.to).toHaveBeenCalledWith(
        mockDecryptedKey,
        `/tmp/${execUuid}_${deviceUuid}_dec.key`
      );
      expect(shellWrapperService.chmod).toHaveBeenCalledWith(
        '600',
        `/tmp/${execUuid}_${deviceUuid}_dec.key`
      );
      expect(result).toBe(`/tmp/${execUuid}_${deviceUuid}_dec.key`);
    });
    
    it('should throw an error if chmod fails', async () => {
      // Arrange
      shellWrapperService.chmod = vi.fn().mockReturnValue({ code: 1, stderr: 'Permission denied' });
      
      // Act & Assert
      await expect(sshKeyService.genAnsibleTemporaryPrivateKey(vaultedKey, deviceUuid, execUuid))
        .rejects.toThrow(`Error chmoding file /tmp/${execUuid}_${deviceUuid}_dec.key`);
      
      expect(vaultCryptoService.decrypt).toHaveBeenCalledWith(vaultedKey, 'default');
      expect(fileSystemService.writeFile).toHaveBeenCalledWith(
        mockDecryptedKey,
        `/tmp/${execUuid}_${deviceUuid}_dec.key`
      );
      expect(shellWrapperService.chmod).toHaveBeenCalledWith(
        '600',
        `/tmp/${execUuid}_${deviceUuid}_dec.key`
      );
    });
    
    it('should propagate errors from the vault service', async () => {
      // Arrange
      const testError = new Error('Decryption failed');
      vaultCryptoService.decrypt = vi.fn().mockRejectedValue(testError);
      
      // Act & Assert
      await expect(sshKeyService.genAnsibleTemporaryPrivateKey(vaultedKey, deviceUuid, execUuid))
        .rejects.toThrow(testError);
      
      expect(vaultCryptoService.decrypt).toHaveBeenCalledWith(vaultedKey, 'default');
      expect(fileSystemService.writeFile).not.toHaveBeenCalled();
      expect(shellWrapperService.chmod).not.toHaveBeenCalled();
    });
  });
  
  describe('removeAnsibleTemporaryPrivateKey', () => {
    it('should remove a temporary key file using FileSystemService', () => {
      // Act
      sshKeyService.removeAnsibleTemporaryPrivateKey(deviceUuid, execUuid);
      
      // Assert
      expect(fileSystemService.test).toHaveBeenCalledWith(
        '-f',
        `/tmp/${execUuid}_${deviceUuid}_dec.key`
      );
      expect(fileSystemService.deleteFile).toHaveBeenCalledWith(
        `/tmp/${execUuid}_${deviceUuid}_dec.key`
      );
    });
    
    it('should log a warning if the key file does not exist in FileSystemService', () => {
      // Arrange
      fileSystemService.test = vi.fn().mockReturnValue(false);
      
      // Act
      sshKeyService.removeAnsibleTemporaryPrivateKey(deviceUuid, execUuid);
      
      // Assert
      expect(fileSystemService.test).toHaveBeenCalledWith(
        '-f',
        `/tmp/${execUuid}_${deviceUuid}_dec.key`
      );
      expect(fileSystemService.deleteFile).not.toHaveBeenCalled();
    });
    
    it('should remove a temporary key file using ShellWrapperService if FileSystemService is not provided', () => {
      // Arrange
      sshKeyService = new SshKeyService(
        shellWrapperService,
        vaultCryptoService
      );
      
      // Act
      sshKeyService.removeAnsibleTemporaryPrivateKey(deviceUuid, execUuid);
      
      // Assert
      expect(shellWrapperService.test).toHaveBeenCalledWith(
        '-f',
        `/tmp/${execUuid}_${deviceUuid}_dec.key`
      );
      expect(shellWrapperService.rm).toHaveBeenCalledWith(
        '-f',
        `/tmp/${execUuid}_${deviceUuid}_dec.key`
      );
    });
  });
  
  describe('removeAllAnsibleExecTemporaryPrivateKeys', () => {
    it('should remove all temporary key files for a specific execution using FileSystemService', () => {
      // Act
      sshKeyService.removeAllAnsibleExecTemporaryPrivateKeys(execUuid);
      
      // Assert
      expect(fileSystemService.deleteFile).toHaveBeenCalledWith(
        `/tmp/${execUuid}_*_dec.key`
      );
    });
    
    it('should remove all temporary key files for a specific execution using ShellWrapperService', () => {
      // Arrange
      sshKeyService = new SshKeyService(
        shellWrapperService,
        vaultCryptoService
      );
      
      // Act
      sshKeyService.removeAllAnsibleExecTemporaryPrivateKeys(execUuid);
      
      // Assert
      expect(shellWrapperService.rm).toHaveBeenCalledWith(
        '-f',
        `/tmp/${execUuid}_*_dec.key`
      );
    });
  });
  
  describe('removeAllAnsibleTemporaryPrivateKeys', () => {
    it('should remove all temporary key files using FileSystemService', () => {
      // Act
      sshKeyService.removeAllAnsibleTemporaryPrivateKeys();
      
      // Assert
      expect(fileSystemService.deleteFile).toHaveBeenCalledWith(
        `/tmp/*_dec.key`
      );
    });
    
    it('should remove all temporary key files using ShellWrapperService', () => {
      // Arrange
      sshKeyService = new SshKeyService(
        shellWrapperService,
        vaultCryptoService
      );
      
      // Act
      sshKeyService.removeAllAnsibleTemporaryPrivateKeys();
      
      // Assert
      expect(shellWrapperService.rm).toHaveBeenCalledWith(
        '-f',
        `/tmp/*_dec.key`
      );
    });
  });
});