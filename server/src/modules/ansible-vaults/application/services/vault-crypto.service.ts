import { Injectable } from '@nestjs/common';
import { VAULT_PWD } from '../../../../config';
import { VaultService } from '@infrastructure/security/vault-crypto/services/vault.service';
import PinoLogger from '../../../../logger';

const logger = PinoLogger.child({ module: 'VaultCryptoService' });

export const DEFAULT_VAULT_ID = 'ssm';

@Injectable()
export class VaultCryptoService {
  private ansibleVault: VaultService;

  constructor() {
    this.ansibleVault = new VaultService({ password: VAULT_PWD });
  }

  /**
   * Encrypt a value using the specified vault ID
   * @param value Value to encrypt
   * @param vaultId ID of the vault to use
   * @returns The encrypted value
   */
  async encrypt(value: string, vaultId: string): Promise<string> {
    logger.debug(`Encrypting value with vault ID: ${vaultId}`);
    return this.ansibleVault.encrypt(value, vaultId);
  }

  /**
   * Decrypt a value using the specified vault ID
   * @param value Value to decrypt
   * @param vaultId ID of the vault to use
   * @returns The decrypted value
   */
  async decrypt(value: string, vaultId: string): Promise<string | undefined> {
    logger.debug(`Decrypting value with vault ID: ${vaultId}`);
    return this.ansibleVault.decrypt(value, vaultId);
  }

  /**
   * Decrypt a value synchronously using the specified vault ID
   * @param value Value to decrypt
   * @param vaultId ID of the vault to use
   * @returns The decrypted value
   */
  decryptSync(value: string, vaultId: string): string | undefined {
    logger.debug(`Synchronously decrypting value with vault ID: ${vaultId}`);
    return this.ansibleVault.decryptSync(value, vaultId);
  }
}