/* global VARIANT */

const subtleCrypto = typeof window !== 'undefined' && window.crypto && window.crypto.subtle

let sha256Async = null

if (typeof VARIANT !== 'undefined' && VARIANT === 'browser' && subtleCrypto) {
  sha256Async = async (data) => {
    return new Uint8Array(await subtleCrypto.digest('SHA-256', new Uint8Array(data)))
  }
} else {
  const asyncify = require('./asyncify')
  const sha256 = require('./sha256')

  sha256Async = asyncify(sha256)
}

module.exports = sha256Async
