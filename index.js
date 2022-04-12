/* global VERSION */

const classes = require('./classes')
const constants = require('./constants')
const functions = require('./functions')

const { Address, PrivateKey, PublicKey, Script, Transaction } = classes
const { isBuffer, generateRandomData, ripemd160, sha1, sha256, sha256d, ripemd160Async, sha1Async, sha256Async } = functions

function makeHashFunctionSafe (f) {
  return (buffer) => {
    if (!isBuffer(buffer)) throw new Error(`not a buffer: ${buffer}`)
    return f(buffer)
  }
}

function getRandomBuffer (size) {
  if (!Number.isInteger(size) || size < 0 || size > 4294967296) throw new Error(`invalid size: ${size}`)
  return generateRandomData(size)
}

const crypto = {
  Hash: {
    ripemd160: makeHashFunctionSafe(ripemd160),
    sha1: makeHashFunctionSafe(sha1),
    sha256: makeHashFunctionSafe(sha256),
    sha256d: makeHashFunctionSafe(sha256d),
    ripemd160Async: makeHashFunctionSafe(ripemd160Async),
    sha1Async: makeHashFunctionSafe(sha1Async),
    sha256Async: makeHashFunctionSafe(sha256Async)
  },
  Random: {
    getRandomBuffer
  }
}

const nimble = {}

nimble.crypto = crypto

nimble.Address = Address
nimble.PublicKey = PublicKey
nimble.PrivateKey = PrivateKey
nimble.Script = Script
nimble.Transaction = Transaction

/**
 * Global flag to enable testnet settings. Defaults to mainnet (false).
 */
nimble.testnet = false

/**
 * Global setting for fee estimation
 */
nimble.feePerKB = 250

/**
 * Global version string
 */
nimble.version = typeof VERSION === 'undefined' ? require('./package.json').version : VERSION

nimble.classes = classes
nimble.constants = constants
nimble.functions = functions

module.exports = nimble
