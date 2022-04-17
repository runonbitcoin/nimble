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

    // Store the buffer. If a view, convert to standlone buffer, so that we can make immutable
    this.buffer = ArrayBuffer.isView(buffer) ? Array.from(buffer) : buffer

    const isTemplate = this.constructor !== Script
    if (isTemplate) {
      // If we are using a template, make sure it matches, and that there is no custom constructor
      if (this.matches(buffer)) throw new Error(`Not a ${this.constructor.name}`)
      if (this.constructor.toString().includes('constructor')) throw new Error('Template constructors not allowed')
    } else {
      // If we are not using a template, see if we can detect one
      const T = Object.values(Script.templates).find(template => template.matches(buffer))
      if (T) Object.setPrototypeOf(this, T.prototype)
    }

    // Make the script immutable, in part so that its safe to cache chunks
    Object.freeze(this.buffer)
    Object.freeze(this)

    // Proxy the script so it may be used in place of a buffer in functions
    return new Proxy(this, {
      get: (target, prop, receiver) => {
        if (prop === Symbol.iterator) return target.buffer[Symbol.iterator].bind(target.buffer)
        if (typeof prop !== 'symbol' && Number.isInteger(parseInt(prop))) return target.buffer[prop]
        return Reflect.get(target, prop, receiver)
      }
    })
  }

  static fromString (s) {
    return Script.fromHex(s)
  }

  static fromHex (s) {
    try {
      return new Script(decodeHex(s))
    } catch (e) {
      throw new Error(`Cannot create Script: ${e.message}`)
    }
  }

  static fromBuffer (buffer) {
    try {
      return new Script(buffer)
    } catch (e) {
      throw new Error(`Cannot create Script: ${e.message}`)
    }
  }

  static from (script) {
    if (script instanceof Script) return script
    if (typeof script === 'string') return Script.fromString(script)
    if (isBuffer(script)) return Script.fromBuffer(script)
    throw new Error(`Invalid script: ${script}`)
  }

  toString () {
    return this.toHex()
  }

  toHex () {
    return encodeHex(this.buffer)
  }

  toBuffer () {
    return this.buffer
  }

  get length () { return this.buffer.length }
  slice (start, end) { return this.buffer.slice(start, end) }

  get chunks () {
    if (SCRIPT_TO_CHUNKS_CACHE.has(this)) return SCRIPT_TO_CHUNKS_CACHE.get(this)
    const chunks = decodeScriptChunks(this.buffer)
    SCRIPT_TO_CHUNKS_CACHE.set(this, chunks)
    return chunks
  }
}

class P2PKHLockScript extends Script {
  static matches (buffer) {
    return isP2PKHLockScript(buffer)
  }

  static fromAddress (address) {
    return new P2PKHLockScript(createP2PKHLockScript(address.toString()))
  }

  toAddress () {
    return Address(extractP2PKHLockScriptPubkeyhash(this.buffer), require('../index').testnet)
  }
}

// Further templates may be added at runtime
Script.templates = { P2PKHLockScript }

module.exports = Script
