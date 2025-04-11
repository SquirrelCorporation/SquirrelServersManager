// Based on https://docs.python.org/2/library/binascii.html

const hexlify = (str) => {
  const bytes = new TextEncoder().encode(str);
  let result = '';
  for (const byte of bytes) {
    result += byte.toString(16).padStart(2, '0');
  }
  return result;
};

const unhexlify = (str) => {
  let result = '';
  for (let i = 0, l = str.length; i < l; i += 2) {
    result += String.fromCharCode(parseInt(str.substr(i, 2), 16));
  }
  return result;
};

export {
  hexlify,
  unhexlify
};

export default {
  b2a_hex: hexlify,
  hexlify: hexlify,

  a2b_hex: unhexlify,
  unhexlify: unhexlify,
};
