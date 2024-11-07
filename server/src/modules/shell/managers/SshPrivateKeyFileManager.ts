import * as os from 'node:os';
import path from 'path';
import logger from '../../../logger';
import { DEFAULT_VAULT_ID, vaultDecrypt } from '../../ansible-vault/ansible-vault';
import { AbstractShellCommander } from '../AbstractShellCommander';
import FileSystemManager from './FileSystemManager';

class SshPrivateKeyFileManager extends AbstractShellCommander {
  constructor() {
    super(logger.child({ module: 'SshPrivateKeyFileManager' }), 'SshPrivateKey');
  }

  getTmpKeyFileName(execUuid: string, deviceUuid: string) {
    return `${execUuid}_${deviceUuid}`;
  }

  getTmpKeyFilePath(fileName: string) {
    return path.join(os.tmpdir(), `${fileName}_dec.key`);
  }

  async genAnsibleTemporaryPrivateKey(sskVaultedKey: string, deviceUuid: string, execUuid: string) {
    const decryptedContent = await vaultDecrypt(sskVaultedKey, DEFAULT_VAULT_ID);
    const tmpKeyFilePath = this.getTmpKeyFilePath(this.getTmpKeyFileName(execUuid, deviceUuid));
    FileSystemManager.writeFile(decryptedContent as string, tmpKeyFilePath);
    return tmpKeyFilePath;
  }

  removeAnsibleTemporaryPrivateKey(deviceUuid: string, execUuid: string) {
    const tmpKeyFilePath = this.getTmpKeyFilePath(`${execUuid}_${deviceUuid}`);
    if (!FileSystemManager.test('-f', tmpKeyFilePath)) {
      this.logger.warn(`remoteAnsibleTemporaryPrivateKey - File not found (${tmpKeyFilePath})`);
    } else {
      FileSystemManager.deleteFile(tmpKeyFilePath);
    }
  }

  removeAllAnsibleExecTemporaryPrivateKeys(execUuid: string) {
    FileSystemManager.deleteFile(this.getTmpKeyFilePath(this.getTmpKeyFileName(execUuid, '*')));
  }

  removeAllAnsibleTemporaryPrivateKeys() {
    FileSystemManager.deleteFile(this.getTmpKeyFilePath('*'));
  }
}

export default new SshPrivateKeyFileManager();
