const {
  BN_SIZE,
  PT_SIZE,
  getMemoryBuffer,
  getEcdsaExports,
  writeBN,
} = require('../wasm/wasm-secp256k1')

function ecdsaVerify(signature, hash32, publicKey) {
  const memory = getMemoryBuffer()
  const rPos = memory.length - BN_SIZE
  const sPos = rPos - BN_SIZE
  const hash32Pos = sPos - BN_SIZE
  const publicKeyPos = hash32Pos - PT_SIZE

  const ecdsaVerify = getEcdsaExports().ecdsa_verify

  writeBN(memory, rPos, signature.r)
  writeBN(memory, sPos, signature.s)
  writeBN(memory, hash32Pos, hash32)
  writeBN(memory, publicKeyPos, publicKey.x)
  writeBN(memory, publicKeyPos + BN_SIZE, publicKey.y)

  return ecdsaVerify(rPos, sPos, hash32Pos, publicKeyPos) === 0
}

module.exports = ecdsaVerify
