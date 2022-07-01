const BufferWriter = require('../classes/buffer-writer')
const writePushData = require('./write-push-data')

function createP2PKHUnlockScript(signature, pubkey) {
  const writer = new BufferWriter()
  writePushData(writer, signature)
  writePushData(writer, pubkey)
  return writer.toBuffer()
}

module.exports = createP2PKHUnlockScript
