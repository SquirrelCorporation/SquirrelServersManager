import { InternalError } from '../../middlewares/api/ApiError';
import { DEFAULT_VAULT_ID, vaultEncrypt } from '../../modules/ansible-vault/ansible-vault';

const SENSITIVE_PLACEHOLDER = 'REDACTED';

export const redactSensitiveInfos = (key?: string) => {
  return key ? SENSITIVE_PLACEHOLDER : undefined;
};

export const preWriteSensitiveInfos = async (newKey: string, originalKey?: string) => {
  if (newKey === 'REDACTED') {
    if (!originalKey) {
      throw new InternalError('Received a redacted key, but original is not set');
    }
    return originalKey;
  } else {
    return await vaultEncrypt(newKey, DEFAULT_VAULT_ID);
  }
};
