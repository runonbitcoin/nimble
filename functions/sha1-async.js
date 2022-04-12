/* global VARIANT */

const subtleCrypto = typeof window !== 'undefined' && window.crypto && window.crypto.subtle

let sha1Async = null

if (typeof VARIANT !== 'undefined' && VARIANT === 'browser' && subtleCrypto) {
  sha1Async = async (data) => {
    return new Uint8Array(await subtleCrypto.digest('SHA-1', new Uint8Array(data)))
  }
} else {
  const asyncify = require('./asyncify')
  const sha1 = require('./sha1')

  sha1Async = asyncify(sha1)
}

module.exports = sha1Async
