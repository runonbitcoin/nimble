const generatePrivateKey = require('../functions/generate-private-key')
const encodeWIF = require('../functions/encode-wif')
const decodeWIF = require('../functions/decode-wif')
const isBuffer = require('../functions/is-buffer')

// These WeakMap caches allow the objects themselves to maintain their immutability
const PRIVATE_KEY_TO_WIF_CACHE = new WeakMap() // Cached to reduce sha256

class PrivateKey {
  constructor (number, testnet, compressed) {
    if (!isBuffer(number)) throw new Error(`Invalid number: ${number}`)
    if (typeof testnet !== 'boolean') throw new Error(`Invalid testnet flag: ${testnet}`)
    if (typeof compressed !== 'boolean') throw new Error(`Invalid compressed flag: ${compressed}`)

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

  static fromRandom (testnet = require('../index').testnet) {
    const number = generatePrivateKey()
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

module.exports = PrivateKey
