import { IAnsibleVault } from '../../domain/entities/ansible-vault.entity';

export const ANSIBLE_VAULT_SERVICE = 'ANSIBLE_VAULT_SERVICE';

/**
 * Interface for the Ansible Vault Service
 */
export interface IAnsibleVaultService {
  /**
   * Get all available vaults
   * @returns List of all vaults (without passwords)
   */
  findAll(): Promise<IAnsibleVault[] | null>;

  /**
   * Create a new vault
   * @param vaultId ID of the vault
   * @param password Password for the vault
   * @returns The created vault
   */
  createVault(vaultId: string, password: string): Promise<IAnsibleVault>;

  /**
   * Delete a vault by ID
   * @param vaultId ID of the vault to delete
   */
  deleteVault(vaultId: string): Promise<void>;

  /**
   * Update an existing vault
   * @param vaultId ID of the vault to update
   * @param password New password for the vault
   * @returns The updated vault
   */
  updateVault(vaultId: string, password: string): Promise<IAnsibleVault | null>;

  /**
   * Get the password for a vault
   * @param vaultId ID of the vault
   * @returns The vault password
   */
  getVaultPassword(vaultId: string): Promise<string>;

  /**
   * Encrypt a value with a specific vault
   * @param value Value to encrypt
   * @param vaultId ID of the vault to use
   * @returns Encrypted value
   */
  encrypt(value: string, vaultId: string): Promise<string>;

  /**
   * Decrypt a value with a specific vault
   * @param value Value to decrypt
   * @param vaultId ID of the vault to use
   * @returns Decrypted value
   */
  decrypt(value: string, vaultId: string): Promise<string | undefined>;

  /**
   * Decrypt a value synchronously with a specific vault
   * @param value Value to decrypt
   * @param vaultId ID of the vault to use
   * @returns Decrypted value
   */
  decryptSync(value: string, vaultId: string): string | undefined;
}
