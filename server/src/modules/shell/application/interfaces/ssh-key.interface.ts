/**
 * Interface for SSH key operations in the application layer
 */
export const SSH_KEY_SERVICE = 'ISshKeyService';

export interface ISshKeyService {
  getTmpKeyFileName(execUuid: string, deviceUuid: string): string;
  getTmpKeyFilePath(fileName: string): string;
  genAnsibleTemporaryPrivateKey(
    sskVaultedKey: string,
    deviceUuid: string,
    execUuid: string,
  ): Promise<string>;
  removeAnsibleTemporaryPrivateKey(deviceUuid: string, execUuid: string): void;
  removeAllAnsibleExecTemporaryPrivateKeys(execUuid: string): void;
  removeAllAnsibleTemporaryPrivateKeys(): void;
}
