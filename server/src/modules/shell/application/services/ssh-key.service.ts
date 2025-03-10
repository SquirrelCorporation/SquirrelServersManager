import * as os from 'node:os';
import path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { DEFAULT_VAULT_ID, VaultCryptoService } from '../../../ansible-vault';
import { ISshKeyService } from '../interfaces/ssh-key.interface';
import { FileSystemService } from './file-system.service';
import { ShellWrapperService } from './shell-wrapper.service';

/**
 * SshKeyService provides methods for managing SSH private keys
 * through a NestJS injectable service.
 * It implements the ISshKeyService interface.
 */
@Injectable()
export class SshKeyService implements ISshKeyService {
  private readonly logger = new Logger(SshKeyService.name);
  private fileSystemService: FileSystemService | null = null;

  constructor(
    private readonly shellWrapper: ShellWrapperService,
    private readonly vaultCryptoService: VaultCryptoService,
    fileSystemService?: FileSystemService,
  ) {
    this.fileSystemService = fileSystemService || null;
  }

  /**
   * Gets the temporary key filename
   * @param execUuid Execution UUID
   * @param deviceUuid Device UUID
   * @returns The temporary key filename
   */
  getTmpKeyFileName(execUuid: string, deviceUuid: string) {
    return `${execUuid}_${deviceUuid}`;
  }

  /**
   * Gets the temporary key file path
   * @param fileName The filename
   * @returns The temporary key file path
   */
  getTmpKeyFilePath(fileName: string) {
    return path.join(os.tmpdir(), `${fileName}_dec.key`);
  }

  /**
   * Generates an Ansible temporary private key
   * @param sskVaultedKey The vaulted SSH key
   * @param deviceUuid Device UUID
   * @param execUuid Execution UUID
   * @returns The path to the temporary key file
   */
  async genAnsibleTemporaryPrivateKey(sskVaultedKey: string, deviceUuid: string, execUuid: string) {
    try {
      const decryptedContent = await this.vaultCryptoService.decrypt(sskVaultedKey, DEFAULT_VAULT_ID);
      const tmpKeyFilePath = this.getTmpKeyFilePath(this.getTmpKeyFileName(execUuid, deviceUuid));

      // Use either FileSystemService or direct ShellWrapper to write the file
      if (this.fileSystemService) {
        this.fileSystemService.writeFile(decryptedContent as string, tmpKeyFilePath);
      } else {
        this.shellWrapper.to(decryptedContent as string, tmpKeyFilePath);
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
   * @param deviceUuid Device UUID
   * @param execUuid Execution UUID
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
   * @param execUuid Execution UUID
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
