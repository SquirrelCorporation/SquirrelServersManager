import crypto from 'crypto';
import { DerivedKey, Unpacked } from '../types';
import * as binascii from '../utils/binascii.util';
import * as pkcs7 from '../utils/pkcs7.util';

const pbkdf2 = crypto.pbkdf2;

const HEADER = '$ANSIBLE_VAULT';
const AES256 = 'AES256';
const CIPHER = 'aes-256-ctr';
const DIGEST = 'sha256';

export class VaultService {
  private readonly password: string;
  /**
   * @param {object} param0
   * @param {string} param0.password vault password
   */
  constructor({ password }: { password: string }) {
    this.password = password;
  }

  /**
   * @private
   * @param {string} header
   * @returns {boolean|string} for 1.2 "id" and for 1.1 `true` if header is ok, otherwise false
   */
  private _checkHeader(header: string): boolean | string {
    if (!header) {
      return false;
    }
    const [_header, version, cipher, id = true] = header.split(';');

    if (_header === HEADER && /^1\.[12]$/.test(version) && cipher === AES256) {
      return id;
    }
    return false;
  }

  /**
   * @private
   * @param {Buffer} key
   * @param {Buffer} ciphertext
   * @returns {Buffer}
   */
  private _hmac(
    key: Buffer | crypto.BinaryLike | crypto.KeyObject,
    ciphertext: Buffer | crypto.BinaryLike,
  ): Buffer {
    const hmac = crypto.createHmac(DIGEST, key as crypto.BinaryLike);
    hmac.update(ciphertext as crypto.BinaryLike);
    return hmac.digest();
  }

  /**
   * @private
   * @param {Buffer} salt
   * @returns {Promise<DerivedKey>}
   */
  private async _derivedKey(salt: Buffer | Uint8Array | crypto.BinaryLike): Promise<DerivedKey> {
    if (!this.password) {
      throw new Error('No password');
    }
    const derivedKey = await new Promise<Buffer>((resolve, reject) => {
      pbkdf2(this.password, salt as crypto.BinaryLike, 10000, 80, DIGEST, (err, key) => {
        if (err) {
          reject(err);
        } else {
          resolve(key);
        }
      });
    });
    return this._deriveKey(derivedKey);
  }

  /**
   * @private
   * @param {Buffer} salt
   * @returns {DerivedKey}
   */
  private _derivedKeySync(salt: Buffer | crypto.BinaryLike): DerivedKey {
    if (!this.password) {
      throw new Error('No password');
    }

    const derivedKey = crypto.pbkdf2Sync(
      this.password,
      salt as crypto.BinaryLike,
      10000,
      80,
      DIGEST,
    );
    return this._deriveKey(derivedKey);
  }

  /**
   *
   * @param {Buffer} derivedKey
   * @returns {DerivedKey}
   */
  private _deriveKey(derivedKey: Buffer): DerivedKey {
    const key = derivedKey.slice(0, 32);
    const hmacKey = derivedKey.slice(32, 64);
    const iv = derivedKey.slice(64, 80);
    return {
      key,
      hmacKey,
      iv,
    };
  }

  /**
   * Encrypt `secret` text
   * @param {string} secret
   * @param {string} id
   * @returns {Promise<string>} encrypted string
   */
  async encrypt(secret: string, id: string): Promise<string> {
    const salt = crypto.randomBytes(32);

    const derivedKey = await this._derivedKey(salt);

    return this._cipher(secret, id, salt, derivedKey);
  }

  /**
   * Synchronously encrypt `secret` text
   * @param {string} secret
   * @param {string} id
   * @returns {string} encrypted string
   */
  encryptSync(secret: string, id: string) {
    const salt = crypto.randomBytes(32);
    const derivedKey = this._derivedKeySync(salt);
    return this._cipher(secret, id, salt, derivedKey);
  }

  /**
   * @private
   * @param {string} secret
   * @param {string} id
   * @param {Buffer} salt
   * @param {DerivedKey} derivedKey
   * @returns
   */
  private _cipher(secret: string, id: string, salt: Buffer, derivedKey: DerivedKey) {
    const { key, hmacKey, iv } = derivedKey;

    const cipherF = crypto.createCipheriv(CIPHER, key, iv);
    const finalInput = Buffer.concat([
      Buffer.from(secret, 'utf-8'),
      pkcs7.pad(Buffer.from(secret, 'utf-8').length, 16),
    ]);

    const ciphertext = Buffer.concat([cipherF.update(finalInput), cipherF.final()]);
    const hmac = this._hmac(hmacKey, ciphertext);
    const hex = [salt, hmac, ciphertext].map((buf) => buf.toString('hex')).join('\n');

    return this._pack(id, hex);
  }

  /**
   * @private
   * @param {Unpacked} unpacked
   * @param {DerivedKey} derivedKey
   * @returns
   */
  private _decypher(unpacked: Unpacked, derivedKey: DerivedKey) {
    const { hmac, ciphertext } = unpacked;
    const { key, hmacKey, iv } = derivedKey;
    const hmacComp = this._hmac(hmacKey, ciphertext);

    if (Buffer.compare(hmacComp, hmac) !== 0) {
      throw new Error('Integrity check failed');
    }

    const cipherF = crypto.createDecipheriv(CIPHER, key, iv);
    const buffer = pkcs7.unpad(Buffer.concat([cipherF.update(ciphertext), cipherF.final()]), 16);

    return buffer.toString();
  }

  /**
   * @private
   * @param {string|undefined} id optional id
   * @param {string} hex hex encoded
   * @returns {string} ansible encoded secret
   */
  private _pack(id: string, hex: string): string {
    const header = id ? `${HEADER};1.2;${AES256};${id}\n` : `${HEADER};1.1;${AES256}\n`;

    return (
      header +
      binascii
        .hexlify(hex)
        .match(/.{1,80}/g)
        ?.join('\n')
    );
  }

  /**
   * @private
   * @param {string} vault
   * @param {string|undefined} id optional id
   * @returns {Unpacked|undefined}
   */
  private _unpack(vault: string, id?: string): Unpacked | undefined {
    const [header, ...hexValues] = vault.split(/\r?\n/);

    const _id = this._checkHeader(header);
    if (!_id) {
      throw new Error('Bad vault header');
    }
    if (id && id !== _id) {
      return;
    } // only decrypt if `id` is matching id in header

    const [salt, hmac, ciphertext] = binascii
      .unhexlify(hexValues.join(''))
      .split(/\r?\n/)
      .map((hex) => Buffer.from(hex, 'hex'));

    if (!salt || !hmac || !ciphertext) {
      throw new Error('Invalid vault');
    }

    return { salt, hmac, ciphertext };
  }

  /**
   * Decrypt vault
   * @param {string} vault
   * @param {string|undefined} id optional id
   * @returns {Promise<string|undefined>}
   */
  async decrypt(vault: string, id?: string): Promise<string | undefined> {
    const unpacked = this._unpack(vault, id);
    if (!unpacked) {
      return;
    }
    const { salt } = unpacked;

    const derivedKey = await this._derivedKey(salt);
    return this._decypher(unpacked, derivedKey);
  }

  /**
   * Synchronously decrypt vault
   * @param {string} vault
   * @param {string|undefined} id optional id
   * @returns {string|undefined}
   */
  decryptSync(vault: string, id?: string): string | undefined {
    const unpacked = this._unpack(vault, id);
    if (!unpacked) {
      return;
    }
    const { salt } = unpacked;

    const derivedKey = this._derivedKeySync(salt);
    return this._decypher(unpacked, derivedKey);
  }
}
