const encodeHex = require('../functions/encode-hex')
const decodeHex = require('../functions/decode-hex')
const decodePublicKey = require('../functions/decode-public-key')
const calculatePublicKey = require('../functions/calculate-public-key')
const encodePublicKey = require('../functions/encode-public-key')

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

// These WeakMap caches allow the objects themselves to maintain their immutability

// Cached to reduce secp256k1 multiplication
const PRIVATE_KEY_TO_PUBLIC_KEY_CACHE = new WeakMap()

// ------------------------------------------------------------------------------------------------
// PublicKey
// ------------------------------------------------------------------------------------------------

class PublicKey {
  constructor (point, testnet, compressed) {
    this.point = point
    this.testnet = testnet
    this.compressed = compressed

    Object.freeze(this)
  }

  static fromString (pubkey) {
    try {
      const point = decodePublicKey(decodeHex(pubkey))
      const testnet = require('../index').testnet
      const compressed = pubkey.length === 66
      return new PublicKey(point, testnet, compressed)
    } catch (e) {
      throw new Error(`Cannot create PublicKey: ${e.message}`)
    }
  }

  static fromPrivateKey (privateKey) {
    if (PRIVATE_KEY_TO_PUBLIC_KEY_CACHE.has(privateKey)) return PRIVATE_KEY_TO_PUBLIC_KEY_CACHE.get(privateKey)

    const PrivateKey = require('./private-key')
    if (!(privateKey instanceof PrivateKey)) throw new Error(`Not a PrivateKey: ${privateKey}`)

    const point = calculatePublicKey(privateKey.number)
    const testnet = privateKey.testnet
    const compressed = privateKey.compressed
    const publicKey = new PublicKey(point, testnet, compressed)

    PRIVATE_KEY_TO_PUBLIC_KEY_CACHE.set(privateKey, publicKey)

    return publicKey
  }

  toString () {
    return encodeHex(this.toBuffer())
  }

  toBuffer () {
    return encodePublicKey(this.point, this.compressed)
  }

  toAddress () {
    const Address = require('./address')
    return Address.fromPublicKey(this)
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = PublicKey
