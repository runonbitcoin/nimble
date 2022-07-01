const encodeHex = require('../functions/encode-hex')
const decodeHex = require('../functions/decode-hex')
const decodePublicKey = require('../functions/decode-public-key')
const calculatePublicKey = require('../functions/calculate-public-key')
const encodePublicKey = require('../functions/encode-public-key')
const isBuffer = require('../functions/is-buffer')
const verifyPoint = require('../functions/verify-point')

// These WeakMap caches allow the objects themselves to maintain their immutability
const PRIVATE_KEY_TO_PUBLIC_KEY_CACHE = new WeakMap() // Cached to reduce secp256k1 multiplication

class PublicKey {
  constructor(point, testnet, compressed, validate = true) {
    if (validate) {
      if (typeof point !== 'object' || !isBuffer(point.x) || !isBuffer(point.y))
        throw new Error('bad point')
      if (typeof testnet !== 'boolean') throw new Error('bad testnet flag')
      if (typeof compressed !== 'boolean')
        throw new Error('bad compressed flag')
      verifyPoint(point)
    }

    this.point = point
    this.testnet = testnet
    this.compressed = compressed

    Object.freeze(this)
  }

  static fromString(pubkey) {
    const point = decodePublicKey(decodeHex(pubkey))
    const testnet = require('../index').testnet
    const compressed = pubkey.length === 66
    return new PublicKey(point, testnet, compressed, false)
  }

  static fromPrivateKey(privateKey) {
    if (PRIVATE_KEY_TO_PUBLIC_KEY_CACHE.has(privateKey))
      return PRIVATE_KEY_TO_PUBLIC_KEY_CACHE.get(privateKey)

    const PrivateKey = require('./private-key')
    if (!(privateKey instanceof PrivateKey))
      throw new Error(`not a PrivateKey: ${privateKey}`)

    const point = calculatePublicKey(privateKey.number)
    const testnet = privateKey.testnet
    const compressed = privateKey.compressed
    const publicKey = new PublicKey(point, testnet, compressed, false)

    PRIVATE_KEY_TO_PUBLIC_KEY_CACHE.set(privateKey, publicKey)

    return publicKey
  }

  static from(x) {
    if (x instanceof PublicKey) return x
    const PrivateKey = require('./private-key')
    if (x instanceof PrivateKey) return PublicKey.fromPrivateKey(x)
    if (typeof x === 'object' && x) x = x.toString()
    if (typeof x === 'string') return PublicKey.fromString(x)
    throw new Error('unsupported type')
  }

  toString() {
    return encodeHex(this.toBuffer())
  }

  toBuffer() {
    return encodePublicKey(this.point, this.compressed)
  }

  toAddress() {
    const Address = require('./address')
    return Address.fromPublicKey(this)
  }
}

module.exports = PublicKey
