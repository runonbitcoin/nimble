const WasmHashes = require('../wasm/wasm-hashes')

function ripemd160 (data) {
  const wasmMemory = WasmHashes.getMemoryBuffer()
  const wasmRipemd160 = WasmHashes.getRipemd160()

  WasmHashes.checkAvailableMemory(data.length + 20)

  const hashDataPos = wasmMemory.length - data.length
  const hashOutPos = hashDataPos - 20

  wasmMemory.set(data, hashDataPos)

  wasmRipemd160(hashDataPos, data.length, hashOutPos)

  return Uint8Array.from(wasmMemory.slice(hashOutPos, hashOutPos + 20))
}

module.exports = ripemd160
