const decodeBase58Check = require('./decode-base58-check')

function decodeWIF (privkey) {
  const { version, payload } = decodeBase58Check(privkey)

  const testnet = version === 0xef

  if (payload.length === 32) {
    return { number: payload, testnet, compressed: false }
  }

  if (payload.length === 33 && payload[payload.length - 1] === 1) {
    return { number: payload.slice(0, 32), testnet, compressed: true }
  }

  throw new Error('bad payload')
}

module.exports = decodeWIF
