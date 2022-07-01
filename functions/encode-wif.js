const encodeBase58Check = require('./encode-base58-check')

function encodeWIF(payload, testnet, compressed = true) {
  return encodeBase58Check(
    testnet ? 0xef : 0x80,
    compressed ? [...payload, 1] : payload
  )
}

module.exports = encodeWIF
