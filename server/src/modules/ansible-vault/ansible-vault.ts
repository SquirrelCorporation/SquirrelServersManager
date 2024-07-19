import { VAULT_PWD } from '../../config';
import Vault from '../../helpers/vault-crypto/Vault';

export const DEFAULT_VAULT_ID = 'ssm';
const ansibleVault = new Vault({ password: VAULT_PWD });

export async function vaultEncrypt(value: string, vaultId: string) {
  return await ansibleVault.encrypt(value, vaultId);
}

export async function vaultDecrypt(value: string, vaultId: string) {
  return await ansibleVault.decrypt(value, vaultId);
}

export function vaultSyncDecrypt(value: string, vaultId: string) {
  return ansibleVault.decryptSync(value, vaultId);
}
