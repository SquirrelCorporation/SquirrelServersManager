import { assert, describe, test } from 'vitest';
import './test-setup';
import pkcs7 from '../../../../helpers/vault-crypto/pkcs7';

describe('pkcs#7', function () {
  describe('pad', function () {
    test('shall throw if blocksize is greater 256', function () {
      const b = Buffer.from('a');
      assert.throws(function () {
        Buffer.concat([b, pkcs7.pad(b.length, 512)]);
      }, /can't pad blocks larger 256 bytes/);
    });

    test('shall pad a buffer of length 1', function () {
      const b = Buffer.from('a');
      const padded = Buffer.concat([b, pkcs7.pad(b.length, 8)]);
      assert.strictEqual(padded.length, 8);
      assert.deepStrictEqual(padded, Buffer.from(new Uint8Array([97, 7, 7, 7, 7, 7, 7, 7])));
    });

    test('shall pad a buffer of length 6', function () {
      const b = Buffer.from('aaaaaa');
      const padded = Buffer.concat([b, pkcs7.pad(b.length, 8)]);
      assert.strictEqual(padded.length, 8);
      assert.deepStrictEqual(padded, Buffer.from(new Uint8Array([97, 97, 97, 97, 97, 97, 2, 2])));
    });

    test('shall pad if block size fits', function () {
      const b = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
      const padded = Buffer.concat([b, pkcs7.pad(b.length, 8)]);
      assert.strictEqual(padded.length, 16);
      assert.deepStrictEqual(
        padded,
        Buffer.from(new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 8, 8, 8, 8, 8, 8, 8, 8])),
      );
    });
  });

  describe('unpad', function () {
    test('shall remove padding for length 1', function () {
      const b = Buffer.from(new Uint8Array([97, 7, 7, 7, 7, 7, 7, 7]));
      const unpadded = pkcs7.unpad(b, 8);
      assert.strictEqual(unpadded.length, 1);
      assert.deepStrictEqual(unpadded, Buffer.from('a'));
    });
    test('shall remove padding for length 6', function () {
      const b = Buffer.from(new Uint8Array([97, 97, 97, 97, 97, 97, 2, 2]));
      const unpadded = pkcs7.unpad(b, 8);
      assert.strictEqual(unpadded.length, 6);
      assert.deepStrictEqual(unpadded, Buffer.from('aaaaaa'));
    });
    test('shall not remove padding on anomaly', function () {
      const b = Buffer.from(new Uint8Array([97, 7, 7, 6, 7, 7, 7, 7]));
      const unpadded = pkcs7.unpad(b, 8);
      assert.strictEqual(unpadded.length, 8);
      assert.deepStrictEqual(unpadded, b);
    });
    test('shall not remove padding if last byte is 0', function () {
      const b = Buffer.from(new Uint8Array([97, 7, 7, 7, 7, 7, 7, 0]));
      const unpadded = pkcs7.unpad(b, 8);
      assert.strictEqual(unpadded.length, 8);
      assert.deepStrictEqual(unpadded, b);
    });
    test('shall remove bytes if block size fits', function () {
      const b = Buffer.from(new Uint8Array([8, 8, 8, 8, 8, 8, 8, 8]));
      const unpadded = pkcs7.unpad(b, 8);
      assert.strictEqual(unpadded.length, 0);
    });
  });

  describe('pad-unpad', function () {
    test('block size does not fit', function () {
      const b = new Uint8Array([7]);
      const padded = Buffer.concat([b, pkcs7.pad(b.length, 8)]);
      const unpadded = pkcs7.unpad(padded, 8);
      assert.deepStrictEqual(unpadded, Buffer.from(b));
    });
    test('block size does not fit len=3', function () {
      const b = new Uint8Array([5, 5, 5]);
      const padded = Buffer.concat([b, pkcs7.pad(b.length, 8)]);
      const unpadded = pkcs7.unpad(padded, 8);
      assert.deepStrictEqual(unpadded, Buffer.from(b));
    });
    test('block size fits', function () {
      const b = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);
      const padded = Buffer.concat([b, pkcs7.pad(b.length, 8)]);
      const unpadded = pkcs7.unpad(padded, 8);
      assert.deepStrictEqual(unpadded, Buffer.from(b));
    });
  });
});
