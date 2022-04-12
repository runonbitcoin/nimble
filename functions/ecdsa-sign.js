const generatePrivateKey = require('./generate-private-key')
const ecdsaSignRaw = require('./ecdsa-sign-raw')

function ecdsaSign (hash32, privateKey, publicKey) {
  while (true) {
    const k = generatePrivateKey()

    const signature = ecdsaSignRaw(hash32, k, privateKey, publicKey)

    if (signature) {
      return { r: signature.r, s: signature.s, k }
    }
  }
}

module.exports = ecdsaSign
