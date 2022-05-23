const { BN_SIZE, getMemoryBuffer, getBnExports, writeBN, getNPos } = require('../wasm/wasm-secp256k1')

function verifyPrivateKey (privateKey) {
  if (privateKey.length !== 32) throw new Error('bad length')

  const memory = getMemoryBuffer()
  const privateKeyPos = memory.length - BN_SIZE
  const bnCmp = getBnExports().bn_cmp
  const N_POS = getNPos()

  writeBN(memory, privateKeyPos, privateKey)

  if (bnCmp(privateKeyPos, N_POS) >= 0) throw new Error('outside range')

  return privateKey
}

module.exports = verifyPrivateKey
