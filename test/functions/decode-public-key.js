const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { generatePrivateKey, decodePublicKey } = nimble.functions
const bsv = require('bsv')

describe('decodePublicKey', () => {
  it('valid uncompressed', () => {
    for (let i = 0; i < 100; i++) {
      const privateKey = generatePrivateKey()
      const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey))
      const bsvPublicKey = new bsv.PublicKey(bsvPrivateKey.toPublicKey().point, { compressed: false })
      const hex = bsvPublicKey.toString()
      const publicKey = decodePublicKey(Buffer.from(hex, 'hex'))
      const xhex1 = Buffer.from(publicKey.x).toString('hex')
      const xhex2 = bsvPublicKey.point.getX().toBuffer().toString('hex')
      const yhex1 = Buffer.from(publicKey.y).toString('hex')
      const yhex2 = bsvPublicKey.point.getY().toBuffer().toString('hex')
      expect(xhex1).to.equal(xhex2)
      expect(yhex1).to.equal(yhex2)
    }
  })

  it('valid compressed', () => {
    for (let i = 0; i < 100; i++) {
      const privateKey = generatePrivateKey()
      const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey))
      const bsvPublicKey = new bsv.PublicKey(bsvPrivateKey.toPublicKey().point, { compressed: true })
      const hex = bsvPublicKey.toString()
      const publicKey = decodePublicKey(Buffer.from(hex, 'hex'))
      const xhex1 = Buffer.from(publicKey.x).toString('hex')
      const xhex2 = bsvPublicKey.point.getX().toBuffer().toString('hex')
      const yhex1 = Buffer.from(publicKey.y).toString('hex')
      const yhex2 = bsvPublicKey.point.getY().toBuffer().toString('hex')
      expect(xhex1).to.equal(xhex2)
      expect(yhex1).to.equal(yhex2)
    }
  })
})
