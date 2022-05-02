const decodeHex = require('./decode-hex')
const opcodes = require('../constants/opcodes')
const BufferWriter = require('../classes/buffer-writer')
const writePushData = require('./write-push-data')

function decodeASM (script) {
  const parts = script.split(' ').filter(x => x.length)
  const writer = new BufferWriter()
  parts.forEach(part => {
    if (part in opcodes) {
      writer.write([opcodes[part]])
    } else {
      const buf = decodeHex(part)
      if (buf.length === 1 && buf[0] <= 16) {
        writer.write(buf[0] ? [80 + buf[0]] : [0])
      } else {
        writePushData(writer, buf)
      }
    }
  })
  return writer.toBuffer()
}

module.exports = decodeASM
