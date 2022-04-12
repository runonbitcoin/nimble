function readVarint (reader) {
  const { buffer, pos: i } = reader

  reader.checkRemaining(1)
  const prefix = buffer[i]

  if (prefix <= 0xfc) {
    reader.pos += 1
    return prefix
  }

  if (prefix === 0xfd) {
    reader.checkRemaining(3)
    reader.pos += 3
    return buffer[i + 2] * 0x0100 + buffer[i + 1]
  }

  if (prefix === 0xfe) {
    reader.checkRemaining(5)
    reader.pos += 5
    return buffer[i + 4] * 0x01000000 + buffer[i + 3] * 0x010000 + buffer[i + 2] * 0x0100 + buffer[i + 1]
  }

  // prefix === 0xff

  reader.checkRemaining(9)
  reader.pos += 9

  const n =
            buffer[i + 8] * 0x0100000000000000 +
            buffer[i + 7] * 0x01000000000000 +
            buffer[i + 6] * 0x010000000000 +
            buffer[i + 5] * 0x0100000000 +
            buffer[i + 4] * 0x01000000 +
            buffer[i + 3] * 0x010000 +
            buffer[i + 2] * 0x0100 +
            buffer[i + 1]

  if (n > Number.MAX_SAFE_INTEGER) throw new Error('varint too large')

  return n
}

module.exports = readVarint
