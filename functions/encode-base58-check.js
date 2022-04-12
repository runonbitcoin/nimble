const encodeBase58 = require('./encode-base58')
const sha256d = require('./sha256d')

function encodeBase58Check (version, payload) {
  const arr = new Uint8Array(payload.length + 5)

  arr[0] = version

  arr.set(payload, 1)

  const checksum = sha256d(arr.slice(0, payload.length + 1))
  arr.set(checksum.slice(0, 4), arr.length - 4)

  return encodeBase58(arr)
}

module.exports = encodeBase58Check
