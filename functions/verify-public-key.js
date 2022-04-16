const { PT_SIZE, BN_SIZE, getMemoryBuffer, getEcdsaExports, writeBN } = require('../wasm/wasm-secp256k1')

function verifyPublicKey (publicKey) {
  const memory = getMemoryBuffer()
  const pos = memory.length - PT_SIZE

  writeBN(memory, pos, publicKey.x)
  writeBN(memory, pos + BN_SIZE, publicKey.y)

  const verified = getEcdsaExports().validate_pubkey(pos) === 0

  if (!verified) throw new Error('bad public key')
}

module.exports = verifyPublicKey
