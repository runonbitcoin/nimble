const { BN_SIZE, getMemoryBuffer, getSecp256k1Exports, writeBN, readBN } = require('../wasm/wasm-secp256k1')

function decodePublicKey (arr) {
  const prefix = arr[0]

  let xstart = 1
  while (!arr[xstart] && xstart < arr.length) xstart++
  if (arr.length < 33) throw new Error('too short')
  const x = arr.slice(xstart, 33)

  if (prefix === 0x04) {
    let ystart = 33
    while (!arr[ystart] && ystart < arr.length) ystart++
    if (arr.length < 65) throw new Error('too short')
    const y = arr.slice(ystart, 65)

    return { x, y }
  }

  const memory = getMemoryBuffer()
  const xPos = memory.length - BN_SIZE
  const yPos = xPos - BN_SIZE

  writeBN(memory, xPos, x)

  getSecp256k1Exports().decompress_y(yPos, xPos, prefix)

  const y = readBN(memory, yPos)

  return { x, y }
}

module.exports = decodePublicKey
