const sha256ripemd160 = require('./sha256ripemd160')
const encodePublicKey = require('./encode-public-key')

function calculatePublicKeyHash (publicKey) {
  return sha256ripemd160(encodePublicKey(publicKey, true))
}

module.exports = calculatePublicKeyHash
