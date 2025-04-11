import { InternalServerException } from '@infrastructure/exceptions/app-exceptions';
import { Injectable } from '@nestjs/common';
import { ISensitiveInfoService } from '../../domain/services/sensitive-info.service.interface';
import { DEFAULT_VAULT_ID, VaultCryptoService } from '@modules/ansible-vaults';

const SENSITIVE_PLACEHOLDER = 'REDACTED';

@Injectable()
export class SensitiveInfoService implements ISensitiveInfoService {
  constructor(private readonly vaultCryptoService: VaultCryptoService) {}

  /**
   * Redacts sensitive information by replacing it with a placeholder
   * @param key The sensitive information to redact
   * @returns A placeholder string or undefined if the key is undefined
   */
  redactSensitiveInfo(key?: string): string | undefined {
    return key ? SENSITIVE_PLACEHOLDER : undefined;
  }

  /**
   * Prepares sensitive information for writing to storage
   * If the new key is the redaction placeholder, returns the original key
   * Otherwise, encrypts the new key
   * @param newKey The new sensitive information
   * @param originalKey The original sensitive information (optional)
   * @returns The prepared sensitive information
   */
  async prepareSensitiveInfoForWrite(newKey: string, originalKey?: string): Promise<string> {
    if (newKey === SENSITIVE_PLACEHOLDER) {
      if (!originalKey) {
        throw new InternalServerException('Received a redacted key, but original is not set');
      }
      return originalKey;
    } else {
      return await this.vaultCryptoService.encrypt(newKey, DEFAULT_VAULT_ID);
    }
  }
}
