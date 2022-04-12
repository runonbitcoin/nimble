function encodePublicKey (publicKey, compressed = true) {
  if (!compressed) {
    const arr = new Uint8Array(65)
    arr[0] = 4
    arr.set(publicKey.x, 1 + 32 - publicKey.x.length)
    arr.set(publicKey.y, 33 + 32 - publicKey.y.length)
    return arr
  }

  const arr = new Uint8Array(33)
  arr[0] = (publicKey.y[publicKey.y.length - 1] & 1) === 0 ? 0x02 : 0x03
  arr.set(publicKey.x, 1 + 32 - publicKey.x.length)
  return arr
}

module.exports = encodePublicKey
