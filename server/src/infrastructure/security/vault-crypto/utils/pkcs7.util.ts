/**
 * pkcs7 pad
 * @param {number} messageLength
 * @param {number} blocksize
 * @returns {Buffer}
 */
function pad(messageLength: number, blocksize: number): Buffer {
  if (blocksize > 256) {
    throw new Error("can't pad blocks larger 256 bytes");
  }
  const padLength = blocksize - (messageLength % blocksize);

  return Buffer.alloc(padLength, Buffer.from([padLength]));
}

/**
 * pkcs7 unpad
 * @param {Buffer} padded
 * @param {number} blocksize
 * @returns {Buffer}
 */
function unpad(padded: Buffer, blocksize: number): Buffer {
  const len = padded.length;
  const byte = padded[len - 1];
  if (byte > blocksize) {
    return padded;
  }
  for (let i = len - byte; i < len; i++) {
    if (padded[i] !== byte) {
      return padded;
    }
  }
  return padded.slice(0, len - byte);
}

export {
  pad,
  unpad
};

export default {
  pad,
  unpad,
};
