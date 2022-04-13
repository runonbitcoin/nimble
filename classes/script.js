const createP2PKHLockScript = require('../functions/create-p2pkh-lock-script')
const isP2PKHLockScript = require('../functions/is-p2pkh-lock-script')
const extractP2PKHLockScriptPubkeyhash = require('../functions/extract-p2pkh-lock-script-pubkeyhash')
const encodeHex = require('../functions/encode-hex')
const decodeHex = require('../functions/decode-hex')
const decodeScriptChunks = require('../functions/decode-script-chunks')
const Address = require('./address')
const isBuffer = require('../functions/is-buffer')

// These WeakMap caches allow the objects themselves to maintain their immutability
const SCRIPT_TO_CHUNKS_CACHE = new WeakMap()

class Script {
  constructor (buffer = []) {
    if (!isBuffer(buffer)) throw new Error(`Not a buffer: ${buffer}`)

    this.buffer = buffer

    // Proxy the script so it may be used in place of a buffer in functions
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop === Symbol.iterator) return target.buffer[Symbol.iterator].bind(target.buffer)
        if (typeof prop !== 'symbol' && Number.isInteger(parseInt(prop))) return target.buffer[prop]
        return Reflect.get(target, prop, receiver)
      },
      set: (target, prop, value, receiver) => {
        if (typeof prop !== 'symbol' && Number.isInteger(parseInt(prop))) return Reflect.set(target.buffer, prop, value)
        return Reflect.set(target, prop, value, receiver)
      }
    })
  }

  static fromString (s) { return Script.fromHex(s) }
  static fromHex (s) { return new Script(decodeHex(s)) }
  static fromBuffer (buffer) { return new Script(buffer) }
  static fromAddress (address) { return new Script(createP2PKHLockScript(address.toString())) }
  static from (script) {
    if (script instanceof Script) return script
    if (typeof script === 'string') return Script.fromString(script)
    if (isBuffer(script)) return Script.fromBuffer(script)
    throw new Error(`Invalid script: ${script}`)
  }

  toString () { return this.toHex() }
  toHex () { return encodeHex(this.buffer) }
  toBuffer () { return this.buffer }
  toAddress () { return this.isP2PKH(this.buffer) && new Address(extractP2PKHLockScriptPubkeyhash(this.buffer), require('../index').testnet) }

  get length () { return this.buffer.length }
  slice (start, end) { return this.buffer.slice(start, end) }

  isP2PKH () { return isP2PKHLockScript(this.buffer) }

  // Locks a script so that no further changes may be made
  finalize () {
    if (Object.isFrozen(this)) throw new Error('Script finalized')
    Object.freeze(this)
    Object.freeze(this.buffer)
    return this
  }

  get chunks () {
    if (Object.isFrozen(this)) {
      if (SCRIPT_TO_CHUNKS_CACHE.has(this)) return SCRIPT_TO_CHUNKS_CACHE.get(this)
      const chunks = decodeScriptChunks(this.buffer)
      SCRIPT_TO_CHUNKS_CACHE.set(this, chunks)
      return chunks
    } else {
      return decodeScriptChunks(this.buffer)
    }
  }
}

module.exports = Script
