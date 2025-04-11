import { describe, expect, test } from 'vitest';
import './test-setup';
import binascii from '../../../../helpers/vault-crypto/binascii';

describe('binascii', () => {
  test('HEXFLIFY one letter', () => {
    expect(binascii.hexlify('A')).toStrictEqual('41');
  });

  test('HEXFLIFY string', () => {
    expect(binascii.hexlify('Pamietamy 44')).toStrictEqual('50616d696574616d79203434');
  });

  test('HEXFLIFY binary data', () => {
    /* prettier-ignore */
    expect(binascii.hexlify('7z¼¯•\'\u001c')).toStrictEqual('377ac2bcc2afe280a2271c');
  });

  test('UNHEXLIFY ', () => {
    expect(binascii.unhexlify(binascii.hexlify('A'))).toStrictEqual('A');
    expect(binascii.unhexlify('50616d696574616d79203434')).toStrictEqual('Pamietamy 44');
  });

  test('UNHEXLIFY binary data ', () => {
    expect(binascii.unhexlify('377abcaf271c')).toStrictEqual("7z¼¯'\u001c");
  });

  test('Ensure single-digit codes are correctly padded ', () => {
    expect(binascii.hexlify('\n')).toStrictEqual('0a');
  });
});
