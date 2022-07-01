const BufferReader = require('../classes/buffer-reader')
const readTx = require('./read-tx')

function decodeTx(buffer) {
  const reader = new BufferReader(buffer)
  const tx = readTx(reader)
  reader.close()
  return tx
}

module.exports = decodeTx
