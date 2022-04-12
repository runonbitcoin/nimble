const encodeAddress = require('../functions/encode-address')
const decodeAddress = require('../functions/decode-address')
const calculatePublicKeyHash = require('../functions/calculate-public-key-hash')

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

// These WeakMap caches allow the objects themselves to maintain their immutability

// Cached to reduce ripemd160 and sha256 hashing
const PUBLIC_KEY_TO_ADDRESS_CACHE = new WeakMap()

// Cached to reduce sha256 hashing
const ADDRESS_TO_STRING_CACHE = new WeakMap()

// ------------------------------------------------------------------------------------------------
// Address
// ------------------------------------------------------------------------------------------------

class Address {
  constructor (pubkeyhash, testnet) {
    this.pubkeyhash = pubkeyhash
    this.testnet = testnet

    Object.freeze(this)
  }

  static fromString (s) {
    const { pubkeyhash, testnet } = decodeAddress(s)
    const address = new Address(pubkeyhash, testnet)
    ADDRESS_TO_STRING_CACHE.set(address, s)
    return address
  }

  static fromPublicKey (publicKey) {
    if (PUBLIC_KEY_TO_ADDRESS_CACHE.has(publicKey)) return PUBLIC_KEY_TO_ADDRESS_CACHE.get(publicKey)

    const testnet = publicKey.testnet
    const pubkeyhash = calculatePublicKeyHash(publicKey.point)
    const address = new Address(pubkeyhash, testnet)

    PUBLIC_KEY_TO_ADDRESS_CACHE.set(publicKey, address)

    return address
  }

  toString () {
    if (ADDRESS_TO_STRING_CACHE.has(this)) return ADDRESS_TO_STRING_CACHE.get(this)
    const address = encodeAddress(this.testnet, this.pubkeyhash)
    ADDRESS_TO_STRING_CACHE.set(this, address)
    return address
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = Address
