import { vi } from 'vitest';
import * as crypto from 'crypto';
import * as fs from 'fs';

// Mock the module aliases first to prevent resolution errors
vi.mock('@modules/ansible-vaults/domain/interfaces/ansible-vault-service.interface', () => ({
  IAnsibleVaultService: vi.fn(), // Mock the interface
  ANSIBLE_VAULT_SERVICE: 'ANSIBLE_VAULT_SERVICE',
}));

vi.mock('@modules/ansible-vaults/domain/interfaces/vault-crypto-service.interface', () => ({
  IVaultCryptoService: vi.fn(),
  VAULT_CRYPTO_SERVICE: 'VAULT_CRYPTO_SERVICE',
}));

vi.mock('@modules/ansible-vaults/domain/repositories/ansible-vault-repository.interface', () => ({
  ANSIBLE_VAULT_REPOSITORY: 'ANSIBLE_VAULT_REPOSITORY',
  IAnsibleVaultRepository: vi.fn(), // Mock the interface
}));

// Import our mock implementations
import { VaultService } from './mocks/infrastructure';
import { MockVaultCryptoService } from './mocks/vault-crypto.service.mock';

// Mock the config import
vi.mock('../../../../config', () => ({
  VAULT_PWD: 'mock-vault-password',
}));

// Mock the logger
vi.mock('../../../../logger', () => ({
  default: {
    child: () => ({
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

// Mock the VaultService from infrastructure correctly - critical for path resolution
vi.mock('@infrastructure/security/vault-crypto/services/vault.service', () => ({
  VaultService: VaultService,
}));

// Also mock the relative path to ensure both paths resolve to the same mock
vi.mock('../../../../infrastructure/security/vault-crypto/services/vault.service', () => ({
  VaultService: VaultService,
}));

// Mock crypto module
vi.mock('crypto', () => ({
  randomBytes: vi.fn().mockReturnValue(Buffer.from('mock-random-bytes')),
  pbkdf2Sync: vi.fn().mockReturnValue(Buffer.from('mock-derived-key')),
  createCipheriv: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnValue(Buffer.from('mock-encrypted-data')),
    final: vi.fn().mockReturnValue(Buffer.from('mock-final-block')),
  }),
  createDecipheriv: vi.fn().mockReturnValue({
    update: vi.fn().mockReturnValue(Buffer.from('mock-decrypted-data')),
    final: vi.fn().mockReturnValue(Buffer.from('mock-final-block')),
  }),
}));

// Mock fs module for file operations
vi.mock('fs', () => ({
  readFileSync: vi.fn().mockImplementation((path) => {
    if (path.includes('vault')) {
      return Buffer.from('$ANSIBLE_VAULT;1.1;AES256\nmock-encrypted-vault-data\n');
    }
    throw new Error(`File not found: ${path}`);
  }),
  writeFileSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
}));

// Mock VaultCryptoService with our implementation
vi.mock('../application/services/vault-crypto.service', () => ({
  VaultCryptoService: MockVaultCryptoService,
  DEFAULT_VAULT_ID: 'ssm',
}));

// Also mock the module alias path for the same class
vi.mock('@modules/ansible-vaults/application/services/vault-crypto.service', () => ({
  VaultCryptoService: MockVaultCryptoService,
  DEFAULT_VAULT_ID: 'ssm',
}));

// Create a mock AnsibleVaultService implementation
const mockAnsibleVaultService = {
  findAll: vi.fn().mockResolvedValue([{ vaultId: 'test-vault', password: 'test-password' }]),
  createVault: vi.fn().mockResolvedValue({ vaultId: 'test-vault', password: 'test-password' }),
  getVaultPassword: vi.fn().mockResolvedValue('test-password'),
  updateVault: vi.fn().mockResolvedValue({ vaultId: 'test-vault', password: 'updated-password' }),
  deleteVault: vi.fn().mockResolvedValue(undefined),
  encrypt: vi.fn().mockResolvedValue('$ANSIBLE_VAULT;1.1;AES256\nmock-encrypted-data'),
  decrypt: vi.fn().mockResolvedValue('mock-decrypted-data'),
  decryptSync: vi.fn().mockReturnValue('mock-decrypted-data-sync'),
};

// Mock AnsibleVaultService
vi.mock('../application/services/ansible-vault.service', () => ({
  AnsibleVaultService: vi.fn().mockImplementation(() => mockAnsibleVaultService),
}));

// Also mock the module alias path for the same class
vi.mock('@modules/ansible-vaults/application/services/ansible-vault.service', () => ({
  AnsibleVaultService: vi.fn().mockImplementation(() => mockAnsibleVaultService),
}));

// Mock Mongoose models
vi.mock('mongoose', () => {
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

  return {
    model: vi.fn().mockReturnValue(mockModel),
    Schema: vi.fn().mockImplementation(() => ({
      pre: vi.fn(),
      index: vi.fn(),
      virtual: vi.fn().mockReturnValue({
        get: vi.fn(),
      }),
    })),
    Types: {
      ObjectId: {
        isValid: vi.fn().mockReturnValue(true),
      },
    },
  };
});

// Create a mock repository that matches the IAnsibleVaultRepository interface
const mockRepository = {
  findAll: vi.fn().mockResolvedValue([{ vaultId: 'test-vault', password: 'test-password' }]),
  create: vi.fn().mockResolvedValue({ vaultId: 'test-vault', password: 'test-password' }),
  findOneByVaultId: vi.fn().mockResolvedValue({ vaultId: 'test-vault', password: 'test-password' }),
  updateOne: vi.fn().mockResolvedValue({ vaultId: 'test-vault', password: 'updated-password' }),
  deleteOne: vi.fn().mockResolvedValue(undefined),
};

// Mock the repository implementation
vi.mock('../infrastructure/repositories/ansible-vault.repository', () => ({
  AnsibleVaultRepository: vi.fn().mockImplementation(() => mockRepository),
}));

// Also mock the module alias path for the repository
vi.mock('@modules/ansible-vaults/infrastructure/repositories/ansible-vault.repository', () => ({
  AnsibleVaultRepository: vi.fn().mockImplementation(() => mockRepository),
}));

// Mock the controller
vi.mock('../presentation/controllers/ansible-vaults.controller', () => ({
  AnsibleVaultsController: vi.fn().mockImplementation(() => ({
    getAllVaults: vi.fn().mockResolvedValue([{ vaultId: 'test-vault', password: 'test-password' }]),
    createVault: vi.fn().mockResolvedValue({ vaultId: 'test-vault', password: 'test-password' }),
    updateVault: vi.fn().mockResolvedValue({ vaultId: 'test-vault', password: 'updated-password' }),
    deleteVault: vi.fn().mockResolvedValue(undefined),
    encryptValue: vi.fn().mockResolvedValue({ value: 'encrypted-value' }),
    decryptValue: vi.fn().mockResolvedValue({ value: 'decrypted-value' }),
  })),
}));

// Export the mocks for use in tests
export { mockRepository, MockVaultCryptoService, VaultService, mockAnsibleVaultService };
