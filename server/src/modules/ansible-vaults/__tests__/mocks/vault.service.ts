/**
 * Mock implementation of the VaultService for testing
 */
export class VaultService {
  private options: { password: string };

  constructor(options: { password: string }) {
    this.options = options;
  }

  /**
   * Encrypt a value
   * @param value Value to encrypt
   * @param vaultId Vault ID to use
   * @returns Encrypted value
   */
  encrypt(value: string, vaultId: string): Promise<string> {
    return Promise.resolve(`$ANSIBLE_VAULT;1.1;AES256\nmock-encrypted-${value}-with-${vaultId}`);
  }

  /**
   * Decrypt a value
   * @param value Value to decrypt
   * @param vaultId Vault ID to use
   * @returns Decrypted value
   */
  decrypt(value: string, vaultId: string): Promise<string> {
    return Promise.resolve(`decrypted-${value}-with-${vaultId}`);
  }

  /**
   * Decrypt a value synchronously
   * @param value Value to decrypt
   * @param vaultId Vault ID to use
   * @returns Decrypted value
   */
  decryptSync(value: string, vaultId: string): string {
    return `decrypted-sync-${value}-with-${vaultId}`;
  }
}