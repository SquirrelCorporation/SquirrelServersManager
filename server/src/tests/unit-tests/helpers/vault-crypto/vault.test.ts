import { beforeEach, describe, expect, test } from 'vitest';
import Vault from '../../../../helpers/vault-crypto/Vault';
import { vaultBadIntegrity, vaultBadValues, vaultId, vaultIdCLRF, vaultOK } from './constants';

describe('Vault', () => {
  let vault: Vault;
  const DEFAULT_VAULT_ID = 'test';
  const secret = 'password: superSecret123!';
  const password = 'pa$$w0rd';

  beforeEach(() => {
    vault = new Vault({ password: 'your-password' });
  });

  test('should encrypt and then decrypt back to original string', async () => {
    const originalString = 'Hello, World!';
    const encrypted = await vault.encrypt(originalString, DEFAULT_VAULT_ID);

    // Ensure it gets encrypted to something else
    expect(encrypted).not.toStrictEqual(originalString);

    // Decrypted text should be same as original
    const decrypted = await vault.decrypt(encrypted, DEFAULT_VAULT_ID);
    expect(decrypted).toStrictEqual(originalString);
  });

  test('should handle special characters correctly', async () => {
    const originalString = 'Hello, §!';
    const encrypted = await vault.encrypt(originalString, DEFAULT_VAULT_ID);

    // Ensure it gets encrypted to something else
    expect(encrypted).not.toStrictEqual(originalString);

    // Decrypted text should be same as original
    const decrypted = await vault.decrypt(encrypted, DEFAULT_VAULT_ID);
    expect(decrypted).toStrictEqual(originalString);
  });

  describe('general', function () {
    test('shall throw on wrong header', async () => {
      const v = new Vault({ password });
      const vault = '';
      await expect(v.decrypt(vault)).rejects.toThrow('Bad vault header');
    });

    test('shall throw on wrong version', async () => {
      const v = new Vault({ password });
      const vault = '$ANSIBLE_VAULT;1.0;AES256\n6135643365643261';
      await expect(v.decrypt(vault)).rejects.toThrow('Bad vault header');
    });

    test('shall throw on wrong cipher', async () => {
      const v = new Vault({ password });
      const vault = '$ANSIBLE_VAULT;1.0;AES128\n6135643365643261';
      await expect(v.decrypt(vault)).rejects.toThrow('Bad vault header');
    });

    test('shall throw on missing content', async () => {
      const v = new Vault({ password });
      const vault = '$ANSIBLE_VAULT;1.1;AES256\n';
      await expect(v.decrypt(vault)).rejects.toThrow('Invalid vault');
    });

    test('shall throw on compromised integrity', async () => {
      const v = new Vault({ password });
      await expect(v.decrypt(vaultBadIntegrity)).rejects.toThrow('Integrity check failed');
    });

    test('shall throw on bad chars', async () => {
      const v = new Vault({ password });
      await expect(v.decrypt(vaultBadValues)).rejects.toThrow('Integrity check failed');
    });

    test('shall throw on missing password', async () => {
      // @ts-expect-error testing
      const v = new Vault({});
      await expect(v.encrypt('vault', DEFAULT_VAULT_ID)).rejects.toThrow('No password');
    });
  });

  describe('1.1', () => {
    test('shall decrypt', async () => {
      const v = new Vault({ password });
      expect(await v.decrypt(vaultOK)).toStrictEqual(secret);
    });

    test('shall encrypt and decrypt', async () => {
      const v = new Vault({ password });
      const _vault = await v.encrypt(secret, DEFAULT_VAULT_ID);
      const _secret = await v.decrypt(_vault, DEFAULT_VAULT_ID);
      expect(_secret).toStrictEqual(secret);
    });
  });

  describe('1.2', () => {
    test('shall decrypt', async () => {
      const v = new Vault({ password });
      expect(await v.decrypt(vaultId, 'prod')).toStrictEqual(secret);
    });

    test('shall decrypt with CLRF', async () => {
      const v = new Vault({ password });
      expect(await v.decrypt(vaultIdCLRF, 'prod')).toStrictEqual(secret);
    });

    test("shall not decrypt if id doesn't match", async () => {
      const v = new Vault({ password });
      expect(await v.decrypt(vaultId, 'test')).toBeUndefined();
    });

    test('shall encrypt and decrypt', async () => {
      const v = new Vault({ password });
      const _vault = await v.encrypt(secret, 'prod');
      expect(_vault.substring(0, 30)).toStrictEqual('$ANSIBLE_VAULT;1.2;AES256;prod');
      const _secret = await v.decrypt(_vault, 'prod');
      expect(_secret).toStrictEqual(secret);
    });

    test('shall encrypt and decrypt (block size fits)', async () => {
      const v = new Vault({ password });
      const secret = 'abcdefgh';
      const _vault = await v.encrypt(secret, 'prod');
      expect(_vault.substring(0, 30)).toStrictEqual('$ANSIBLE_VAULT;1.2;AES256;prod');
      const _secret = await v.decrypt(_vault, 'prod');
      expect(_secret).toStrictEqual(secret);
    });
  });

  describe('sync operations', function () {
    test('shall decrypt synchronously', function () {
      const v = new Vault({ password });
      expect(v.decryptSync(vaultOK)).toStrictEqual(secret);
    });

    test('shall encrypt and decrypt synchronously', function () {
      const v = new Vault({ password });
      expect(v.decryptSync(v.encryptSync(secret, DEFAULT_VAULT_ID))).toStrictEqual(secret);
    });
  });

  describe('Padding', () => {
    test('should correctly pad non-block-sized text', () => {
      const blocksize = 16;

      const originalString = 'abc'; // size is not a multiple of blocksize
      expect(originalString.length % blocksize).not.toStrictEqual(0);

      const encrypted = vault.encryptSync(originalString, 'secret-key');

      // encrypted text (minus initialization vector and MAC length) should be a multiple of blocksize if padded correctly
      const ciphertext = Buffer.from(encrypted, 'hex');
      const encryptedSize = ciphertext.length - blocksize * 2; // subtract size of IV and MAC

      expect(encryptedSize % blocksize).toBeCloseTo(0);
    });

    test('should correctly unpad decrypted text', () => {
      const originalString = 'a'.repeat(30); // size is not a multiple of blocksize
      const encrypted = vault.encryptSync(originalString, 'secret-key');
      const decrypted = vault.decryptSync(encrypted, 'secret-key');

      expect(decrypted).toStrictEqual(originalString);
    });
  });
});
