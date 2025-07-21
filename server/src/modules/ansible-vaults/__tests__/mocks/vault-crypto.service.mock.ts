import { Injectable } from '@nestjs/common';
import { IVaultCryptoService } from '../../../domain/interfaces/vault-crypto-service.interface';

/**
 * Mock implementation of VaultCryptoService
 */
@Injectable()
export class MockVaultCryptoService implements IVaultCryptoService {
  /**
   * Encrypt a value using the specified vault ID
   * @param value Value to encrypt
   * @param vaultId ID of the vault to use
   * @returns The encrypted value
   */
  async encrypt(value: string, vaultId: string): Promise<string> {
    return `$ANSIBLE_VAULT;1.1;AES256\nmock-encrypted-${value}-with-${vaultId}`;
  }

  /**
   * Decrypt a value using the specified vault ID
   * @param value Value to decrypt
   * @param vaultId ID of the vault to use
   * @returns The decrypted value
   */
  async decrypt(value: string, vaultId: string): Promise<string | undefined> {
    return `decrypted-${value}-with-${vaultId}`;
  }

  /**
   * Decrypt a value synchronously using the specified vault ID
   * @param value Value to decrypt
   * @param vaultId ID of the vault to use
   * @returns The decrypted value
   */
  decryptSync(value: string, vaultId: string): string | undefined {
    return `decrypted-sync-${value}-with-${vaultId}`;
  }
}
