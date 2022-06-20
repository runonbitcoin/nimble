const BufferWriter = require('../classes/buffer-writer')
const writePushData = require('./write-push-data')

function createSafeDataScript (data = []) {
  const writer = new BufferWriter()
  writer.write([0]) // OP_FALSE
  writer.write([106]) // OP_RETURN

  try {
    const datas = Array.isArray(data) ? data : [data];
    datas.forEach(data => writePushData(writer, new Buffer.from(data)))
  } catch (err) {
    throw new Error('invalid data ', err)
  }

  return writer.toBuffer()
}

module.exports = createSafeDataScript
