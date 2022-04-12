/* global VARIANT */

const WasmHashes = require('../wasm/wasm-hashes')

let sha256d = null

if (typeof VARIANT !== 'undefined' && VARIANT === 'browser') {
  sha256d = function (data) {
    const wasmMemory = WasmHashes.getMemoryBuffer()
    const wasmSha256 = WasmHashes.getSha256()

    WasmHashes.checkAvailableMemory(data.length + 32 + 32)

    const hashDataPos = wasmMemory.length - data.length
    const hashOutPos1 = hashDataPos - 32
    const hashOutPos2 = hashOutPos1 - 32

    wasmMemory.set(data, hashDataPos)

    wasmSha256(hashDataPos, data.length, hashOutPos1)
    wasmSha256(hashOutPos1, 32, hashOutPos2)

    return Uint8Array.from(wasmMemory.slice(hashOutPos2, hashOutPos2 + 32))
  }
} else {
  const sha256 = require('./sha256')
  sha256d = (data) => sha256(sha256(data))
}

module.exports = sha256d
