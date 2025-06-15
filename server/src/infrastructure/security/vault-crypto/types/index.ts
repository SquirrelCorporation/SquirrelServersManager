export type DerivedKey = {
  key: Buffer;
  hmacKey: Buffer;
  iv: Buffer;
};

export type Unpacked = {
  salt: Buffer;
  hmac: Buffer;
  ciphertext: Buffer;
};
