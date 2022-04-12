const { BN_SIZE, PT_SIZE, getMemoryBuffer, getEcdsaExports, writeBN, readBN } = require('../wasm/wasm-secp256k1')

function ecdsaSignRaw (hash32, k, privateKey, publicKey) {
  const memory = getMemoryBuffer()
  const hash32Pos = memory.length - BN_SIZE
  const kPos = hash32Pos - BN_SIZE
  const privateKeyPos = kPos - BN_SIZE
  const publicKeyPos = privateKeyPos - PT_SIZE
  const rPos = publicKeyPos - BN_SIZE
  const sPos = rPos - BN_SIZE

  const ecdsaSign = getEcdsaExports().ecdsa_sign

  writeBN(memory, hash32Pos, hash32)
  writeBN(memory, kPos, k)
  writeBN(memory, privateKeyPos, privateKey)
  writeBN(memory, publicKeyPos, publicKey.x)
  writeBN(memory, publicKeyPos + BN_SIZE, publicKey.y)

  if (ecdsaSign(rPos, sPos, hash32Pos, kPos, privateKeyPos, publicKeyPos)) {
    return null
  }

  return {
    r: readBN(memory, rPos),
    s: readBN(memory, sPos)
  }
}

module.exports = ecdsaSignRaw
