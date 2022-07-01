function readU32LE(reader) {
  reader.checkRemaining(4)

  const { buffer, pos: i } = reader

  reader.pos += 4

  // We can't use a bit shift for the high-order byte because in JS this math is 32-bit signed.
  return (
    (buffer[i + 3] << 23) * 2 +
    ((buffer[i + 2] << 16) | (buffer[i + 1] << 8) | (buffer[i + 0] << 0))
  )
}

module.exports = readU32LE
