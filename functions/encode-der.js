const BufferWriter = require('../classes/buffer-writer')
const writeDER = require('./write-der')

function encodeDER(signature) {
  const writer = new BufferWriter()
  writeDER(writer, signature)
  return writer.toBuffer()
}

module.exports = encodeDER
