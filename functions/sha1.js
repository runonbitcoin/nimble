/* global VARIANT */

const WasmHashes = require('../wasm/wasm-hashes')

let sha1 = null

// If we don't know the VARIANT, prefer our implementation to avoid the crypto shim in the browser

if (typeof VARIANT === 'undefined' || VARIANT === 'browser') {
  sha1 = function (data) {
    const wasmMemory = WasmHashes.getMemoryBuffer()
    const wasmSha1 = WasmHashes.getSha1()

    WasmHashes.checkAvailableMemory(data.length + 20)

    const hashDataPos = wasmMemory.length - data.length
    const hashOutPos = hashDataPos - 20

    wasmMemory.set(data, hashDataPos)

    wasmSha1(hashDataPos, data.length, hashOutPos)

    return new Uint8Array(wasmMemory.slice(hashOutPos, hashOutPos + 20))
  }
} else {
  sha1 = (data) => {
    const hash = require('crypto').createHash('sha1')
    hash.update(new Uint8Array(data))
    return hash.digest()
  }
}

module.exports = sha1
