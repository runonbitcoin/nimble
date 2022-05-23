/* global VARIANT */

const WasmHashes = require('../wasm/wasm-hashes')

let sha256 = null

// If we don't know the VARIANT, prefer our implementation to avoid the crypto shim in the browser

if (typeof VARIANT === 'undefined' || VARIANT === 'browser') {
  sha256 = function (data) {
    const wasmMemory = WasmHashes.getMemoryBuffer()
    const wasmSha256 = WasmHashes.getSha256()

    WasmHashes.checkAvailableMemory(data.length + 32)

    const hashDataPos = wasmMemory.length - data.length
    const hashOutPos = hashDataPos - 32

    wasmMemory.set(data, hashDataPos)

    wasmSha256(hashDataPos, data.length, hashOutPos)

    return new Uint8Array(wasmMemory.slice(hashOutPos, hashOutPos + 32))
  }
} else {
  sha256 = (data) => {
    const hash = require('crypto').createHash('sha256')
    hash.update(new Uint8Array(data))
    return hash.digest()
  }
}

module.exports = sha256
