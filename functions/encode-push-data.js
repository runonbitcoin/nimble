const BufferWriter = require('../classes/buffer-writer')
const writePushData = require('./write-push-data')

function encodePushData(buffer) {
  const writer = new BufferWriter()
  writePushData(writer, buffer)
  return writer.toBuffer()
}

module.exports = encodePushData
