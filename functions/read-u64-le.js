function readU64LE (reader) {
  reader.checkRemaining(8)

  const { buffer, pos: i } = reader

  reader.pos += 8

  // We can't use a bit shift for the high-order byte because in JS this math is 32-bit signed.
  let n = buffer[i + 7]
  n = n << 8 | buffer[i + 6]
  n = n << 8 | buffer[i + 5]
  n = n * 256 + buffer[i + 4]
  n = n * 256 + buffer[i + 3]
  n = n * 256 + buffer[i + 2]
  n = n * 256 + buffer[i + 1]
  n = n * 256 + buffer[i + 0]

  return n
}

module.exports = readU64LE
