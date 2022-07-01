const decodeBase58Check = require('./decode-base58-check')
const verifyPrivateKey = require('./verify-private-key')

function decodeWIF(privkey) {
  const { version, payload } = decodeBase58Check(privkey)

  const testnet = version === 0xef

  let number
  let compressed

  if (payload.length === 32) {
    compressed = false
    number = payload
  } else if (payload.length === 33) {
    compressed = true
    number = payload.slice(0, 32)
  } else {
    throw new Error('bad length')
  }

  verifyPrivateKey(number)

  return { number, testnet, compressed }
}

module.exports = decodeWIF
