function writePushData (writer, buffer) {
  if (buffer.length === 1 && buffer[0] <= 16) {
    writer.write([buffer[0] ? buffer[0] + 80 : 0])
  } else if (buffer.length <= 75) {
    writer.write([buffer.length]) // OP_PUSH(buffer.length)
    writer.write(buffer)
  } else if (buffer.length <= 0xFF) {
    writer.write([76, buffer.length]) // OP_PUSHDATA1
    writer.write(buffer)
  } else if (buffer.length <= 0xFFFF) {
    writer.write([77, buffer.length % 256, buffer.length >> 8]) // OP_PUSHDATA2
    writer.write(buffer)
  } else if (buffer.length <= 0xFFFFFFFF) {
    const prefix = new Uint8Array(5)
    prefix[0] = 78 // OP_PUSHDATA4
    let n = buffer.length
    prefix[1] = n % 256
    n = Math.floor(n / 256)
    prefix[2] = n % 256
    n = Math.floor(n / 256)
    prefix[3] = n % 256
    n = Math.floor(n / 256)
    prefix[4] = n
    writer.write(prefix)
    writer.write(buffer)
  } else {
    throw new Error('data too large')
  }
  return writer
}

module.exports = writePushData
