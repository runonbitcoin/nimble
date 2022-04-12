const encodeDER = require('./encode-der')
const sighash = require('./sighash')
const ecdsaSign = require('./ecdsa-sign')

const SIGHASH_ALL = 0x01
const SIGHASH_FORKID = 0x40

function generateTxSignature (tx, vin, parentScript, parentSatoshis, privateKey, publicKey, sighashFlags = SIGHASH_ALL) {
  sighashFlags |= SIGHASH_FORKID
  const hash = sighash(tx, vin, parentScript, parentSatoshis, sighashFlags)
  const signature = ecdsaSign(hash, privateKey, publicKey)
  const dersig = encodeDER(signature)
  return Array.from([...dersig, sighashFlags])
}

module.exports = generateTxSignature
