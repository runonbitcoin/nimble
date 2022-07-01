/* global VARIANT */

function generateRandomData(size) {
  if (typeof VARIANT !== 'undefined' && VARIANT === 'browser') {
    return global.crypto.getRandomValues(new Uint8Array(size))
  } else if (typeof VARIANT !== 'undefined' && VARIANT === 'node') {
    return require('crypto').randomBytes(size)
  } else {
    // If we don't know the variant, then we don't want any potential bundler to know we might be
    // using the crypto library, because then it might shim it unnecessarily in the browser, so
    // we store the 'crypto' string in bytes instead.
    const cryptoString = String.fromCharCode(0x63, 0x72, 0x79, 0x70, 0x74, 0x6f)
    const crypto = require(cryptoString)
    return crypto
      ? crypto.randomBytes(size)
      : global.crypto.getRandomValues(new Uint8Array(size))
  }
}

module.exports = generateRandomData
