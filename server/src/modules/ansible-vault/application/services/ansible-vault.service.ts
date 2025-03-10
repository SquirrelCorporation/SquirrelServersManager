import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { VAULT_PWD } from '../../../../config';
import { IAnsibleVault } from '../../domain/entities/ansible-vault.entity';
import { ANSIBLE_VAULT_REPOSITORY, IAnsibleVaultRepository } from '../../domain/repositories/ansible-vault-repository.interface';
import PinoLogger from '../../../../logger';
import { DEFAULT_VAULT_ID, VaultCryptoService } from './vault-crypto.service';

const logger = PinoLogger.child({ module: 'AnsibleVaultService' });

@Injectable()
export class AnsibleVaultService {
  constructor(
    @Inject(ANSIBLE_VAULT_REPOSITORY)
    private readonly ansibleVaultRepository: IAnsibleVaultRepository,
    private readonly vaultCryptoService: VaultCryptoService
  ) {}

  /**
   * Get all available vaults
   * @returns List of all vaults (without passwords)
   */
  async findAll(): Promise<IAnsibleVault[] | null> {
    logger.info('Finding all vaults');
    return this.ansibleVaultRepository.findAll();
  }

  /**
   * Create a new vault
   * @param vaultId ID of the vault
   * @param password Password for the vault
   * @returns The created vault
   */
  async createVault(vaultId: string, password: string): Promise<IAnsibleVault> {
    logger.info(`Creating vault with ID: ${vaultId}`);
    return this.ansibleVaultRepository.create({ vaultId, password });
  }

  /**
   * Delete a vault by ID
   * @param vaultId ID of the vault to delete
   */
  async deleteVault(vaultId: string): Promise<void> {
    logger.info(`Deleting vault with ID: ${vaultId}`);
    const vault = await this.ansibleVaultRepository.findOneByVaultId(vaultId);

    if (!vault) {
      throw new NotFoundException(`Vault with ID ${vaultId} not found`);
    }

    await this.ansibleVaultRepository.deleteOne(vault);
  }

  /**
   * Update an existing vault
   * @param vaultId ID of the vault to update
   * @param password New password for the vault
   * @returns The updated vault
   */
  async updateVault(vaultId: string, password: string): Promise<IAnsibleVault | null> {
    logger.info(`Updating vault with ID: ${vaultId}`);
    const vault = await this.ansibleVaultRepository.findOneByVaultId(vaultId);

    if (!vault) {
      throw new NotFoundException(`Vault with ID ${vaultId} not found`);
    }

    vault.password = password;
    return this.ansibleVaultRepository.updateOne(vault);
  }

  /**
   * Get the password for a vault
   * @param vaultId ID of the vault
   * @returns The vault password
   */
  async getVaultPassword(vaultId: string): Promise<string> {
    logger.info(`Getting password for vault with ID: ${vaultId}`);

    // Handle default vaults
    if (vaultId === 'default' || vaultId === DEFAULT_VAULT_ID) {
      return VAULT_PWD;
    }

    const vault = await this.ansibleVaultRepository.findOneByVaultId(vaultId);

    if (!vault) {
      throw new NotFoundException(`Vault with ID ${vaultId} not found`);
    }

    return vault.password;
  }

  /**
   * Encrypt a value with a specific vault
   * @param value Value to encrypt
   * @param vaultId ID of the vault to use
   * @returns Encrypted value
   */
  async encrypt(value: string, vaultId: string): Promise<string> {
    return this.vaultCryptoService.encrypt(value, vaultId);
  }

  /**
   * Decrypt a value with a specific vault
   * @param value Value to decrypt
   * @param vaultId ID of the vault to use
   * @returns Decrypted value
   */
  async decrypt(value: string, vaultId: string): Promise<string | undefined> {
    return this.vaultCryptoService.decrypt(value, vaultId);
  }

  /**
   * Decrypt a value synchronously with a specific vault
   * @param value Value to decrypt
   * @param vaultId ID of the vault to use
   * @returns Decrypted value
   */
  decryptSync(value: string, vaultId: string): string | undefined {
    return this.vaultCryptoService.decryptSync(value, vaultId);
  }
}