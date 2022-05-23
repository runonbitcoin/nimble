const encodeBase58Check = require('./encode-base58-check')

function encodeAddress (pubkeyhash, testnet) {
  return encodeBase58Check(testnet ? 0x6f : 0x00, pubkeyhash)
}

module.exports = encodeAddress
