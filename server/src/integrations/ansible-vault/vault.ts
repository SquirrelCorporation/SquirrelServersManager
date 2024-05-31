import { Vault } from 'ansible-vault';
import { VAULT_PWD } from '../../config';

export const DEFAULT_VAULT_ID = 'ssm';
const vault = new Vault({ password: VAULT_PWD });

export async function vaultEncrypt(value: string, vaultId: string) {
  return await vault.encrypt(value, vaultId);
}

export async function vaultDecrypt(value: string, vaultId: string) {
  return await vault.decrypt(value, vaultId);
}

export function vaultSyncDecrypt(value: string, vaultId: string) {
  return vault.decryptSync(value, vaultId);
}
