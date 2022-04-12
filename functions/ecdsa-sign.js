const generatePrivateKey = require('./generate-private-key')
const ecdsaSignWithK = require('./ecdsa-sign-with-k')

function ecdsaSign (hash32, privateKey, publicKey) {
  while (true) {
    const k = generatePrivateKey()

    const signature = ecdsaSignWithK(hash32, k, privateKey, publicKey)

    if (signature) {
      return { r: signature.r, s: signature.s, k }
    }
  }
}

module.exports = ecdsaSign
