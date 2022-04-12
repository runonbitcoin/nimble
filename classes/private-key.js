const generatePrivateKey = require('../functions/generate-private-key')
const encodeWIF = require('../functions/encode-wif')
const decodeWIF = require('../functions/decode-wif')

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

// These WeakMap caches allow the objects themselves to maintain their immutability

// Cached to reduce sha256
const PRIVATE_KEY_TO_WIF_CACHE = new WeakMap()

// ------------------------------------------------------------------------------------------------
// PrivateKey
// ------------------------------------------------------------------------------------------------

class PrivateKey {
  constructor (number, testnet, compressed) {
    this.number = number
    this.testnet = testnet
    this.compressed = compressed

    Object.freeze(this)
  }

  static fromString (wif) {
    try {
      const { number, testnet, compressed } = decodeWIF(wif)
      const privateKey = new PrivateKey(number, testnet, compressed)
      PRIVATE_KEY_TO_WIF_CACHE.set(privateKey, wif)
      return privateKey
    } catch (e) {
      throw new Error(`Cannot create PrivateKey: ${e.message}`)
    }
  }

  static fromRandom () {
    const number = generatePrivateKey()
    const testnet = require('../index').testnet
    const compressed = true
    return new PrivateKey(number, testnet, compressed)
  }

  toString () {
    if (PRIVATE_KEY_TO_WIF_CACHE.has(this)) return PRIVATE_KEY_TO_WIF_CACHE.get(this)
    const wif = encodeWIF(this.number, this.testnet, this.compressed)
    PRIVATE_KEY_TO_WIF_CACHE.set(this, wif)
    return wif
  }

  toPublicKey () {
    const PublicKey = require('./public-key')
    return PublicKey.fromPrivateKey(this)
  }

  toAddress () {
    return this.toPublicKey().toAddress()
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = PrivateKey
