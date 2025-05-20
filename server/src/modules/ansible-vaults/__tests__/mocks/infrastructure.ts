/**
 * This file provides mocks for infrastructure-level modules to avoid import errors
 */

/**
 * VaultService mock implementation
 */
export class VaultService {
  private options: { password: string };

  constructor(options: { password: string }) {
    this.options = options;
  }

  async encrypt(value: string, vaultId: string): Promise<string> {
    return `$ANSIBLE_VAULT;1.1;AES256\nmock-encrypted-${value}-with-${vaultId}`;
  }

  async decrypt(value: string, vaultId: string): Promise<string> {
    return `decrypted-${value}-with-${vaultId}`;
  }

  decryptSync(value: string, vaultId: string): string {
    return `decrypted-sync-${value}-with-${vaultId}`;
  }
}