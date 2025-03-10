import { AnsibleVaultModule } from './ansible-vault.module';
import { AnsibleVaultService } from './application/services/ansible-vault.service';
import { DEFAULT_VAULT_ID, VaultCryptoService } from './application/services/vault-crypto.service';
import { IAnsibleVault } from './domain/entities/ansible-vault.entity';

// Re-export the module
export { AnsibleVaultModule };

// Re-export types and constants
export { IAnsibleVault, DEFAULT_VAULT_ID };

// Re-export services
export { VaultCryptoService };

// Re-export the encrypt/decrypt functions in a way that's compatible with the legacy API
export const vaultEncrypt = async (value: string, vaultId: string): Promise<string> => {
  const service = globalThis.nestApp?.get(VaultCryptoService);
  if (!service) {
    throw new Error('VaultCryptoService not available. Make sure the application is initialized.');
  }
  return service.encrypt(value, vaultId);
};

export const vaultDecrypt = async (value: string, vaultId: string): Promise<string> => {
  const service = globalThis.nestApp?.get(VaultCryptoService);
  if (!service) {
    throw new Error('VaultCryptoService not available. Make sure the application is initialized.');
  }
  return service.decrypt(value, vaultId);
};

export const vaultSyncDecrypt = (value: string, vaultId: string): string => {
  const service = globalThis.nestApp?.get(VaultCryptoService);
  if (!service) {
    throw new Error('VaultCryptoService not available. Make sure the application is initialized.');
  }
  return service.decryptSync(value, vaultId);
};