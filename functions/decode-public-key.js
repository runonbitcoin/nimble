const { BN_SIZE, getMemoryBuffer, getSecp256k1Exports, writeBN, readBN } = require('../wasm/wasm-secp256k1')

function decodePublicKey (buffer) {
  const prefix = buffer[0]

  if (buffer.length < 33) throw new Error('too short')

  let xstart = 1
  while (!buffer[xstart] && xstart < buffer.length) xstart++
  const x = buffer.slice(xstart, 33)

  if (prefix === 0x04) {
    if (buffer.length < 65) throw new Error('too short')

    let ystart = 33
    while (!buffer[ystart] && ystart < buffer.length) ystart++
    const y = buffer.slice(ystart, 65)

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
