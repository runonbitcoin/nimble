const encodeAddress = require('../functions/encode-address')
const decodeAddress = require('../functions/decode-address')
const calculatePublicKeyHash = require('../functions/calculate-public-key-hash')
const isBuffer = require('../functions/is-buffer')

// These WeakMap caches allow the objects themselves to maintain their immutability
const PUBLIC_KEY_TO_ADDRESS_CACHE = new WeakMap() // Cached to reduce ripemd160 and sha256 hashing
const ADDRESS_TO_STRING_CACHE = new WeakMap() // Cached to reduce sha256 hashing

class Address {
  constructor (pubkeyhash, testnet, validate = true) {
    if (validate) {
      try {
        if (!isBuffer(pubkeyhash) || pubkeyhash.length !== 20) throw new Error('bad pubkeyhash')
        if (typeof testnet !== 'boolean') throw new Error('bad testnet flag')
      } catch (e) {
        throw new Error(`Cannot create Address: ${e.message}`)
      }
    }

    this.pubkeyhash = pubkeyhash
    this.testnet = testnet

    Object.freeze(this)
  }

  static fromString (s) {
    const { pubkeyhash, testnet } = decodeAddress(s)
    const address = new Address(pubkeyhash, testnet, false)
    ADDRESS_TO_STRING_CACHE.set(address, s)
    return address
  }

  static fromPublicKey (publicKey) {
    if (PUBLIC_KEY_TO_ADDRESS_CACHE.has(publicKey)) return PUBLIC_KEY_TO_ADDRESS_CACHE.get(publicKey)

    const testnet = publicKey.testnet
    const pubkeyhash = calculatePublicKeyHash(publicKey.point)
    const address = new Address(pubkeyhash, testnet, false)

    PUBLIC_KEY_TO_ADDRESS_CACHE.set(publicKey, address)

    return address
  }

  static from (x) {
    if (x instanceof Address) return x
    if (typeof x === 'string') return Address.fromString(x)
    const PublicKey = require('./public-key')
    if (x instanceof PublicKey) return Address.fromPublicKey(x)
    throw new Error('Cannot create Address: unsupported type')
  }

  toString () {
    if (ADDRESS_TO_STRING_CACHE.has(this)) return ADDRESS_TO_STRING_CACHE.get(this)
    const address = encodeAddress(this.testnet, this.pubkeyhash)
    ADDRESS_TO_STRING_CACHE.set(this, address)
    return address
  }

  toScript () {
    const Script = require('./script')
    return Script.templates.P2PKHLockScript.fromAddress(this)
  }
}

module.exports = Address
