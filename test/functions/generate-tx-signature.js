const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { PrivateKey } = nimble
const {
  generateTxSignature, generateTxSignatureAsync, createP2PKHLockScript, encodeHex, sha256d, encodeTx, createP2PKHUnlockScript
} = nimble.functions
const bsv = require('bsv')

describe('generateTxSignature', () => {
  it('generates signature that bsv library validates', async () => {
    for (let i = 0; i < 10; i++) {
      const privateKey = PrivateKey.fromRandom()
      const publicKey = privateKey.toPublicKey()

      const parentSatoshis = 123
      const parentScript = createP2PKHLockScript(privateKey.toAddress().pubkeyhash)

      const parentTx = {
        outputs: [
          {
            satoshis: parentSatoshis,
            script: parentScript
          }
        ]
      }

      const parentTxid = encodeHex(sha256d(encodeTx(parentTx)).reverse())

      const tx = {
        inputs: [
          {
            txid: parentTxid,
            vout: 0
          }
        ]
      }

      const vin = 0

      const txsignature = generateTxSignature(tx, vin, parentScript, parentSatoshis, privateKey.number, publicKey.point)
      const scriptSig = new bsv.Script(encodeHex(createP2PKHUnlockScript(txsignature, publicKey.toBuffer())))
      const scriptPubkey = new bsv.Script(encodeHex(parentScript))
      const bsvtx = new bsv.Transaction(encodeHex(encodeTx(tx)))
      const flags = bsv.Script.Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID
      const satoshisBN = new bsv.crypto.BN(parentSatoshis)
      const interpreter = new bsv.Script.Interpreter()
      const verified = interpreter.verify(scriptSig, scriptPubkey, bsvtx, vin, flags, satoshisBN)
      expect(verified).to.equal(true)

      const txsignature2 = await generateTxSignatureAsync(tx, vin, parentScript, parentSatoshis, privateKey.number, publicKey.point)
      const scriptSig2 = new bsv.Script(encodeHex(createP2PKHUnlockScript(txsignature2, publicKey.toBuffer())))
      const scriptPubkey2 = new bsv.Script(encodeHex(parentScript))
      const bsvtx2 = new bsv.Transaction(encodeHex(encodeTx(tx)))
      const flags2 = bsv.Script.Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID
      const satoshisBN2 = new bsv.crypto.BN(parentSatoshis)
      const interpreter2 = new bsv.Script.Interpreter()
      const verified2 = interpreter2.verify(scriptSig2, scriptPubkey2, bsvtx2, vin, flags2, satoshisBN2)
      expect(verified2).to.equal(true)
    }
  })
})
