const { BN_SIZE, getMemoryBuffer, getNPos, getBnExports, writeBN } = require('../wasm/wasm-secp256k1')
const generateRandomData = require('./generate-random-data')

function generatePrivateKey () {
  const memory = getMemoryBuffer()
  const privateKeyPos = memory.length - BN_SIZE
  const bnCmp = getBnExports().bn_cmp
  const N_POS = getNPos()

  while (true) {
    const privateKey = generateRandomData(32)

    writeBN(memory, privateKeyPos, privateKey)

    if (bnCmp(privateKeyPos, N_POS) < 0) {
      return privateKey
    }
  }
}

module.exports = generatePrivateKey
