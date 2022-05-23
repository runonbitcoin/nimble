const { describe, it } = require('mocha')
const { expect } = require('chai')
require('chai').use(require('chai-as-promised'))
const nimble = require('../env/nimble')
const { PrivateKey } = nimble
const {
  verifyTxSignature, verifyTxSignatureAsync, encodeHex, sha256d, encodeTx,
  createP2PKHLockScript, decodeHex
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

  it('returns false if signature does not validate', async () => {
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

    const badTxSignature = decodeHex('3045022100fa477f79af22e87989e8a00c2bd20554d8fe78988ff1ff688e7227fb36ae5e2d0220072bbbf1e0ee223e483a8b4f87f2ddf1dbf8f4c38aef08c5f3e2dc1919de37a141')

    const verified1 = verifyTxSignature(tx, vin, badTxSignature, publicKey.point, parentScript, parentSatoshis)
    expect(verified1).to.equal(false)

    const verified2 = await verifyTxSignatureAsync(tx, vin, badTxSignature, publicKey.point, parentScript, parentSatoshis)
    expect(verified2).to.equal(false)
  })

  it('throws if parameters are bad', () => {
    const privateKey = PrivateKey.fromString('KyeSztFuEdrjeMvVyPcunJUSC5hukFUDzUSYrBbmJBTZsHLpyoJb')
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
    const signature = decodeHex('3044022017c28246004cab9a5c8a4bb4e0acd1216c309847610dd3542cde27ce8a96bdf2022051b275f6111a3e0a80ef3926c94793a697d29904be72b7e1e32b7b43d9b7c29741')

    expect(() => verifyTxSignature(tx, vin, signature, 'pubkey', parentScript, parentSatoshis)).to.throw()
    expect(() => verifyTxSignature(tx, vin, 'signature', publicKey.point, parentScript, parentSatoshis)).to.throw()

    expect(verifyTxSignatureAsync(tx, vin, signature, 'pubkey', parentScript, parentSatoshis)).to.be.rejected // eslint-disable-line
    expect(verifyTxSignatureAsync(tx, vin, 'signature', publicKey.point, parentScript, parentSatoshis)).to.be.rejected // eslint-disable-line
  })
})
