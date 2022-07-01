const BufferReader = require('../classes/buffer-reader')
const readDER = require('./read-der')

function decodeDER(buffer) {
  const reader = new BufferReader(buffer)
  const signature = readDER(reader)
  reader.close()
  return signature
}

module.exports = decodeDER
