/**
 * AnsibleVault entity interface in the domain layer
 */
export interface IAnsibleVault {
  _id?: string;
  vaultId: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
} 