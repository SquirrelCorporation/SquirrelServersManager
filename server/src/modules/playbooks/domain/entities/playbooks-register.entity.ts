/**
 * Interface for the playbooks repository entity in the domain layer
 */
export interface IPlaybooksRegister {
  _id?: string;
  uuid: string;
  name: string;
  description?: string;
  path: string;
  type: 'local' | 'git';
  enabled: boolean;
  gitUrl?: string;
  gitBranch?: string;
  gitUsername?: string;
  gitPassword?: string;
  gitPrivateKey?: string;
  gitPassphrase?: string;
  createdAt?: Date;
  updatedAt?: Date;
  vaults?: string[];
}