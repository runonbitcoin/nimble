/* global VARIANT */

const WasmHashes = require('../wasm/wasm-hashes')

let sha256ripemd160 = null

if (typeof VARIANT !== 'undefined' && VARIANT === 'browser') {
  sha256ripemd160 = function (data) {
    const wasmMemory = WasmHashes.getMemoryBuffer()
    const wasmSha256 = WasmHashes.getSha256()
    const wasmRipemd160 = WasmHashes.getRipemd160()

    WasmHashes.checkAvailableMemory(data.length + 32 + 20)

    const hashDataPos = wasmMemory.length - data.length
    const hashOutPos1 = hashDataPos - 32
    const hashOutPos2 = hashOutPos1 - 20

    wasmMemory.set(data, hashDataPos)

    wasmSha256(hashDataPos, data.length, hashOutPos1)
    wasmRipemd160(hashOutPos1, 32, hashOutPos2)

    return Uint8Array.from(wasmMemory.slice(hashOutPos2, hashOutPos2 + 20))
  }
} else {
  const sha256 = require('./sha256')
  const ripemd160 = require('./ripemd160')
  sha256ripemd160 = (data) => ripemd160(sha256(data))
}

module.exports = sha256ripemd160
