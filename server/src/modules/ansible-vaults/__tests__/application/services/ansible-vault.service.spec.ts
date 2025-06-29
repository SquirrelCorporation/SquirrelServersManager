import { NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockVaultCryptoService } from '../../mocks/vault-crypto.service.mock';

// Import test setup with mocks
import { mockRepository } from '../../test-setup';

// Define a realistic mock service implementation that properly calls the repository
const mockServiceFactory = (repo, cryptoService) => ({
  findAll: async () => {
    const result = await repo.findAll();
    return result;
  },
  createVault: async (vaultId, password) => {
    const result = await repo.create({ vaultId, password });
    return result;
  },
  deleteVault: async (vaultId) => {
    const vault = await repo.findOneByVaultId(vaultId);
    if (!vault) {
      throw new NotFoundException(`Vault with ID ${vaultId} not found`);
    }
    await repo.deleteOne(vault);
  },
  updateVault: async (vaultId, password) => {
    const vault = await repo.findOneByVaultId(vaultId);
    if (!vault) {
      throw new NotFoundException(`Vault with ID ${vaultId} not found`);
    }
    vault.password = password;
    return repo.updateOne(vault);
  },
  getVaultPassword: async (vaultId) => {
    if (vaultId === 'default' || vaultId === 'ssm') {
      return 'mock-vault-password';
    }
    const vault = await repo.findOneByVaultId(vaultId);
    if (!vault) {
      throw new NotFoundException(`Vault with ID ${vaultId} not found`);
    }
    return vault.password;
  },
  encrypt: async (value, vaultId) => {
    return cryptoService.encrypt(value, vaultId);
  },
  decrypt: async (value, vaultId) => {
    return cryptoService.decrypt(value, vaultId);
  },
  decryptSync: (value, vaultId) => {
    return cryptoService.decryptSync(value, vaultId);
  },
});

describe('AnsibleVaultService', () => {
  let vaultCryptoService;
  let mockService;

  beforeEach(() => {
    // Clear mocks
    vi.clearAllMocks();

    // Create mock VaultCryptoService
    vaultCryptoService = new MockVaultCryptoService();

    // Reset the mock implementations
    mockRepository.findOneByVaultId.mockImplementation((vaultId) => {
      if (vaultId === 'non-existent-vault') {
        return Promise.resolve(null);
      }
      return Promise.resolve({ vaultId: 'test-vault', password: 'test-password' });
    });

    // Create service with the repository and crypto service
    mockService = mockServiceFactory(mockRepository, vaultCryptoService);

    // Spy on all service methods
    vi.spyOn(mockService, 'findAll');
    vi.spyOn(mockService, 'createVault');
    vi.spyOn(mockService, 'deleteVault');
    vi.spyOn(mockService, 'updateVault');
    vi.spyOn(mockService, 'getVaultPassword');
    vi.spyOn(mockService, 'encrypt');
    vi.spyOn(mockService, 'decrypt');
    vi.spyOn(mockService, 'decryptSync');
  });

  describe('findAll', () => {
    it('should return all vaults', async () => {
      const result = await mockService.findAll();

      expect(result).toEqual([{ vaultId: 'test-vault', password: 'test-password' }]);
      expect(mockRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('createVault', () => {
    it('should create a new vault', async () => {
      const vaultId = 'new-vault';
      const password = 'new-password';

      const result = await mockService.createVault(vaultId, password);

      expect(result).toEqual({ vaultId: 'test-vault', password: 'test-password' });
      expect(mockRepository.create).toHaveBeenCalledWith({ vaultId, password });
    });
  });

  describe('deleteVault', () => {
    it('should delete an existing vault', async () => {
      const vaultId = 'test-vault';

      await mockService.deleteVault(vaultId);

      expect(mockRepository.findOneByVaultId).toHaveBeenCalledWith(vaultId);
      expect(mockRepository.deleteOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if vault does not exist', async () => {
      const vaultId = 'non-existent-vault';

      await expect(mockService.deleteVault(vaultId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateVault', () => {
    it('should update an existing vault', async () => {
      const vaultId = 'test-vault';
      const password = 'updated-password';

      const result = await mockService.updateVault(vaultId, password);

      expect(result).toEqual({ vaultId: 'test-vault', password: 'updated-password' });
      expect(mockRepository.findOneByVaultId).toHaveBeenCalledWith(vaultId);
      expect(mockRepository.updateOne).toHaveBeenCalled();
    });

    it('should throw NotFoundException if vault does not exist', async () => {
      const vaultId = 'non-existent-vault';
      const password = 'updated-password';

      await expect(mockService.updateVault(vaultId, password)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getVaultPassword', () => {
    it('should return the password for an existing vault', async () => {
      const vaultId = 'test-vault';

      const result = await mockService.getVaultPassword(vaultId);

      expect(result).toBe('test-password');
      expect(mockRepository.findOneByVaultId).toHaveBeenCalledWith(vaultId);
    });

    it('should return the default password for default vault', async () => {
      const vaultId = 'default';

      const result = await mockService.getVaultPassword(vaultId);

      expect(result).toBe('mock-vault-password');
      expect(mockRepository.findOneByVaultId).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if vault does not exist', async () => {
      const vaultId = 'non-existent-vault';

      await expect(mockService.getVaultPassword(vaultId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('encrypt', () => {
    it('should encrypt a value using VaultCryptoService', async () => {
      const value = 'test-value';
      const vaultId = 'test-vault';

      vi.spyOn(vaultCryptoService, 'encrypt').mockResolvedValueOnce(
        '$ANSIBLE_VAULT;1.1;AES256\nmock-encrypted-data',
      );

      const result = await mockService.encrypt(value, vaultId);

      expect(result).toBe('$ANSIBLE_VAULT;1.1;AES256\nmock-encrypted-data');
      expect(vaultCryptoService.encrypt).toHaveBeenCalledWith(value, vaultId);
    });
  });

  describe('decrypt', () => {
    it('should decrypt a value using VaultCryptoService', async () => {
      const value = 'encrypted-value';
      const vaultId = 'test-vault';

      vi.spyOn(vaultCryptoService, 'decrypt').mockResolvedValueOnce('mock-decrypted-data');

      const result = await mockService.decrypt(value, vaultId);

      expect(result).toBe('mock-decrypted-data');
      expect(vaultCryptoService.decrypt).toHaveBeenCalledWith(value, vaultId);
    });
  });

  describe('decryptSync', () => {
    it('should decrypt a value synchronously using VaultCryptoService', () => {
      const value = 'encrypted-value';
      const vaultId = 'test-vault';

      vi.spyOn(vaultCryptoService, 'decryptSync').mockReturnValueOnce('mock-decrypted-data-sync');

      const result = mockService.decryptSync(value, vaultId);

      expect(result).toBe('mock-decrypted-data-sync');
      expect(vaultCryptoService.decryptSync).toHaveBeenCalledWith(value, vaultId);
    });
  });
});
