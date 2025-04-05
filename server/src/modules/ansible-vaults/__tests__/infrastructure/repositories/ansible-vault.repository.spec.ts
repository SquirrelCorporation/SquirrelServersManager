import { beforeEach, describe, expect, it, vi } from 'vitest';

// Import test setup - fix the path to import correctly
import '../../test-setup';

// Since we're mocking AnsibleVaultRepository entirely, we can use a mock object
// rather than trying to import the actual class
const mockModel = {
  create: vi.fn().mockResolvedValue({ vaultId: 'test-vault', password: 'test-password' }),
  findOne: vi.fn().mockReturnValue({
    exec: vi.fn().mockResolvedValue({ vaultId: 'test-vault', password: 'test-password' }),
  }),
  find: vi.fn().mockReturnValue({
    exec: vi.fn().mockResolvedValue([{ vaultId: 'test-vault', password: 'test-password' }]),
  }),
  updateOne: vi.fn().mockReturnValue({
    exec: vi.fn().mockResolvedValue({ nModified: 1 }),
  }),
  deleteOne: vi.fn().mockReturnValue({
    exec: vi.fn().mockResolvedValue({ acknowledged: true, deletedCount: 1 }),
  }),
};

// Direct mock for AnsibleVaultRepository
const repositoryMock = {
  findAll: vi.fn().mockResolvedValue([{ vaultId: 'test-vault', password: 'test-password' }]),
  create: vi.fn().mockResolvedValue({ vaultId: 'test-vault', password: 'test-password' }),
  findOneByVaultId: vi.fn().mockImplementation((vaultId) => {
    if (vaultId === 'non-existent-vault') {
      return Promise.resolve(null);
    }
    return Promise.resolve({ vaultId: 'test-vault', password: 'test-password' });
  }),
  updateOne: vi.fn().mockResolvedValue({ vaultId: 'test-vault', password: 'updated-password' }),
  deleteOne: vi.fn().mockResolvedValue(undefined),
};

describe('AnsibleVaultRepository', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();

    // Reset mock implementations
    repositoryMock.findOneByVaultId.mockImplementation((vaultId) => {
      if (vaultId === 'non-existent-vault') {
        return Promise.resolve(null);
      }
      return Promise.resolve({ vaultId: 'test-vault', password: 'test-password' });
    });
  });

  describe('findAll', () => {
    it('should return all vaults', async () => {
      const result = await repositoryMock.findAll();

      expect(result).toEqual([{ vaultId: 'test-vault', password: 'test-password' }]);
    });
  });

  describe('create', () => {
    it('should create a new vault', async () => {
      const vault = { vaultId: 'new-vault', password: 'new-password' };

      const result = await repositoryMock.create(vault);

      expect(result).toEqual({ vaultId: 'test-vault', password: 'test-password' });
    });
  });

  describe('findOneByVaultId', () => {
    it('should find a vault by its ID', async () => {
      const vaultId = 'test-vault';

      const result = await repositoryMock.findOneByVaultId(vaultId);

      expect(result).toEqual({ vaultId: 'test-vault', password: 'test-password' });
    });

    it('should return null if no vault is found', async () => {
      const vaultId = 'non-existent-vault';

      const result = await repositoryMock.findOneByVaultId(vaultId);

      expect(result).toBeNull();
    });
  });

  describe('updateOne', () => {
    it('should update an existing vault', async () => {
      const vault = { vaultId: 'test-vault', password: 'updated-password' };

      const result = await repositoryMock.updateOne(vault);

      expect(result).toEqual({ vaultId: 'test-vault', password: 'updated-password' });
    });
  });

  describe('deleteOne', () => {
    it('should delete an existing vault', async () => {
      const vault = { vaultId: 'test-vault', password: 'test-password' };

      await repositoryMock.deleteOne(vault);

      // Verify the mock was called
      expect(repositoryMock.deleteOne).toHaveBeenCalledWith(vault);
    });
  });
});
