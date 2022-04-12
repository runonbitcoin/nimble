const decodeBase58 = require('./decode-base58')
const sha256d = require('./sha256d')

function decodeBase58Check (s) {
  const arr = decodeBase58(s)

  const version = arr[0]

  const checksum = sha256d(arr.slice(0, arr.length - 4))

  if (checksum[0] !== arr[arr.length - 4] ||
    checksum[1] !== arr[arr.length - 3] ||
    checksum[2] !== arr[arr.length - 2] ||
    checksum[3] !== arr[arr.length - 1]) {
    throw new Error('bad checksum')
  }

  const payload = arr.slice(1, arr.length - 4)

  return { version, payload }
}

module.exports = decodeBase58Check
