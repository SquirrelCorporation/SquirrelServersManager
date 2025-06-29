export const VAULT_CRYPTO_SERVICE = 'VAULT_CRYPTO_SERVICE';

/**
 * Interface for the Vault Crypto Service
 */
export interface IVaultCryptoService {
  /**
   * Encrypt a value using the specified vault ID
   * @param value Value to encrypt
   * @param vaultId ID of the vault to use
   * @returns The encrypted value
   */
  encrypt(value: string, vaultId: string): Promise<string>;

  /**
   * Decrypt a value using the specified vault ID
   * @param value Value to decrypt
   * @param vaultId ID of the vault to use
   * @returns The decrypted value
   */
  decrypt(value: string, vaultId: string): Promise<string | undefined>;

  /**
   * Decrypt a value synchronously using the specified vault ID
   * @param value Value to decrypt
   * @param vaultId ID of the vault to use
   * @returns The decrypted value
   */
  decryptSync(value: string, vaultId: string): string | undefined;
}
