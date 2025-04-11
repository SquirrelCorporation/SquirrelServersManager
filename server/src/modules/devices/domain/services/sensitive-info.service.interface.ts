export const SENSITIVE_INFO_SERVICE = 'SENSITIVE_INFO_SERVICE';

export interface ISensitiveInfoService {
  /**
   * Redacts sensitive information by replacing it with a placeholder
   * @param key The sensitive information to redact
   * @returns A placeholder string or undefined if the key is undefined
   */
  redactSensitiveInfo(key?: string): string | undefined;

  /**
   * Prepares sensitive information for writing to storage
   * If the new key is the redaction placeholder, returns the original key
   * Otherwise, encrypts the new key
   * @param newKey The new sensitive information
   * @param originalKey The original sensitive information (optional)
   * @returns The prepared sensitive information
   */
  prepareSensitiveInfoForWrite(newKey: string, originalKey?: string): Promise<string>;
} 