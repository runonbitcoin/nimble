const decodeDER = require('./decode-der')
const sighash = require('./sighash')
const ecdsaVerify = require('./ecdsa-verify')

function verifyTxSignature (tx, vin, signature, pubkey, parentScript, parentSatoshis) {
  const dersig = signature.slice(0, signature.length - 1)
  const sighashFlags = signature[signature.length - 1]
  const hash = sighash(tx, vin, parentScript, parentSatoshis, sighashFlags)
  try {
    return ecdsaVerify(decodeDER(dersig), hash, pubkey)
  } catch (e) {
    return false
  }
}

module.exports = verifyTxSignature
