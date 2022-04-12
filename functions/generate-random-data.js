/* global VARIANT */

function generateRandomData (size) {
  if (typeof VARIANT !== 'undefined' && VARIANT === 'browser') {
    return global.crypto.getRandomValues(new Uint8Array(size))
  } else {
    return require('crypto').randomBytes(size)
  }
}

module.exports = generateRandomData
