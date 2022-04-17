const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { PrivateKey } = nimble
const {
  verifyTxSignature, verifyTxSignatureAsync, encodeHex, sha256d, encodeTx, createP2PKHLockScript
} = nimble.functions
const bsv = require('bsv')

describe('verifyTxSignature', () => {
  it('validates bsv library signature', async () => {
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

      const bsvtx = new bsv.Transaction(encodeHex(encodeTx(tx)))
      bsvtx.inputs[0].output = new bsv.Transaction.Output({
        satoshis: parentSatoshis,
        script: new bsv.Script(encodeHex(parentScript))
      })
      Object.setPrototypeOf(bsvtx.inputs[0], bsv.Transaction.Input.PublicKeyHash.prototype)
      const bsvPrivateKey = new bsv.PrivateKey(privateKey.toString())

      bsvtx.sign(bsvPrivateKey)

      const txsignature = bsvtx.inputs[0].script.chunks[0].buf

      const verified1 = verifyTxSignature(tx, vin, txsignature, publicKey.point, parentScript, parentSatoshis)
      expect(verified1).to.equal(true)

      const verified2 = await verifyTxSignatureAsync(tx, vin, txsignature, publicKey.point, parentScript, parentSatoshis)
      expect(verified2).to.equal(true)
    }
  })
})
