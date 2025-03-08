import { IAnsibleVault } from '../entities/ansible-vault.entity';

export const ANSIBLE_VAULT_REPOSITORY = 'ANSIBLE_VAULT_REPOSITORY';

/**
 * AnsibleVault repository interface in the domain layer
 */
export interface IAnsibleVaultRepository {
  findAll(): Promise<IAnsibleVault[] | null>;
  create(ansibleVault: Partial<IAnsibleVault>): Promise<IAnsibleVault>;
  deleteOne(ansibleVault: IAnsibleVault): Promise<void>;
  findOneByVaultId(vaultId: string): Promise<IAnsibleVault | null>;
  updateOne(ansibleVault: IAnsibleVault): Promise<IAnsibleVault | null>;
}