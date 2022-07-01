const BufferWriter = require('../classes/buffer-writer')
const writeTx = require('./write-tx')

function encodeTx(tx) {
  const writer = new BufferWriter()
  writeTx(writer, tx)
  return writer.toBuffer()
}

module.exports = encodeTx
