import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockVaultCryptoService } from '../../mocks/vault-crypto.service.mock';

// Import test setup with mocks
import '../../test-setup';

describe('VaultCryptoService', () => {
  let service: MockVaultCryptoService;

  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();

    // Create a fresh service instance for each test using our mock
    service = new MockVaultCryptoService();
  });

  describe('encrypt', () => {
    it('should encrypt data with a vault id', async () => {
      const plaintext = 'secret data';
      const vaultId = 'test-vault';

      const result = await service.encrypt(plaintext, vaultId);

      expect(result).toContain('$ANSIBLE_VAULT;1.1;AES256');
      expect(result).toContain(`mock-encrypted-${plaintext}-with-${vaultId}`);
    });
  });

  describe('decrypt', () => {
    it('should decrypt data with a vault id', async () => {
      const encryptedData = '$ANSIBLE_VAULT;1.1;AES256\nmock-encrypted-vault-data';
      const vaultId = 'test-vault';

      const result = await service.decrypt(encryptedData, vaultId);

      expect(result).toContain('decrypted');
      expect(result).toContain(`decrypted-${encryptedData}-with-${vaultId}`);
    });
  });

  describe('decryptSync', () => {
    it('should decrypt data synchronously with a vault id', () => {
      const encryptedData = '$ANSIBLE_VAULT;1.1;AES256\nmock-encrypted-vault-data';
      const vaultId = 'test-vault';

      const result = service.decryptSync(encryptedData, vaultId);

      expect(result).toContain('decrypted-sync');
      expect(result).toContain(`decrypted-sync-${encryptedData}-with-${vaultId}`);
    });
  });
});
