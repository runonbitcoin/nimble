const decodeDER = require('./decode-der')
const sighashAsync = require('./sighash-async')
const ecdsaVerifyAsync = require('./ecdsa-verify-async')

async function verifyTxSignatureAsync (tx, vin, signature, pubkey, parentScript, parentSatoshis) {
  const dersig = signature.slice(0, signature.length - 1)
  const sighashFlags = signature[signature.length - 1]
  const hash = await sighashAsync(tx, vin, parentScript, parentSatoshis, sighashFlags)
  try {
    return await ecdsaVerifyAsync(decodeDER(dersig), hash, pubkey)
  } catch (e) {
    return false
  }
}

module.exports = verifyTxSignatureAsync
