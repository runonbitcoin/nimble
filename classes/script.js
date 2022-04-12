const createP2PKHLockScript = require('../functions/create-p2pkh-lock-script')
const isP2PKHLockScript = require('../functions/is-p2pkh-lock-script')
const extractP2PKHLockScriptPubkeyhash = require('../functions/extract-p2pkh-lock-script-pubkeyhash')
const encodeHex = require('../functions/encode-hex')
const decodeHex = require('../functions/decode-hex')
const decodeScriptChunks = require('../functions/decode-script-chunks')
const Address = require('./address')

// These WeakMap caches allow the objects themselves to maintain their immutability
const SCRIPT_TO_CHUNKS_CACHE = new WeakMap()

class Script {
  constructor (buffer = []) {
    this.buffer = buffer

    Object.freeze(this)
    Object.freeze(this.buffer)
  }

  static fromString (s) { return Script.fromHex(s) }
  static fromHex (s) { return new Script(decodeHex(s)) }
  static fromBuffer (buffer) { return new Script(buffer) }
  static fromAddress (address) { return new Script(createP2PKHLockScript(address.toString())) }

  toString () { return this.toHex() }
  toHex () { return encodeHex(this.buffer) }
  toBuffer () { return this.buffer }
  toAddress () { return this.isP2PKH(this.buffer) && new Address(extractP2PKHLockScriptPubkeyhash(this.buffer), require('../index').testnet) }

  isP2PKH () { return isP2PKHLockScript(this.buffer) }

  get chunks () {
    if (SCRIPT_TO_CHUNKS_CACHE.has(this)) return SCRIPT_TO_CHUNKS_CACHE.get(this)
    const chunks = decodeScriptChunks(this.buffer)
    SCRIPT_TO_CHUNKS_CACHE.set(this, chunks)
    return chunks
  }
}

module.exports = Script
