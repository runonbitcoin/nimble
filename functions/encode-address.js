const encodeBase58Check = require('./encode-base58-check')

function encodeAddress (testnet, pubkeyhash) {
  return encodeBase58Check(testnet ? 0x6f : 0x00, pubkeyhash)
}

module.exports = encodeAddress
