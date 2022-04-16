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

  it('keys with zero prefixes', () => {
    const shortCompressed = [
      2, 0, 221, 62, 61, 19, 166, 177, 126, 56, 13, 99, 181, 179, 30, 140, 44, 30, 198, 254,
      38, 53, 76, 23, 54, 114, 251, 36, 47, 51, 175, 43, 151
    ]

    const shortUncompressed = [
      4, 59, 175, 128, 195, 151, 76, 161, 225, 98, 94, 14, 18, 44, 201, 89, 239, 146, 210,
      217, 55, 214, 36, 173, 12, 61, 207, 171, 215, 150, 107, 123, 15, 0, 198, 214, 244, 171,
      26, 58, 87, 180, 53, 125, 76, 235, 181, 203, 237, 77, 44, 130, 221, 222, 26, 140,
      123, 152, 93, 36, 28, 241, 201, 64, 103
    ]

    expect(() => decodePublicKey(shortCompressed)).not.to.throw()
    expect(() => decodePublicKey(shortUncompressed)).not.to.throw()
  })

  it('throws if too short', () => {
    const shortCompressed = [
      2, 221, 62, 61, 19, 166, 177, 126, 56, 13, 99, 181, 179, 30, 140, 44, 30, 198, 254,
      38, 53, 76, 23, 54, 114, 251, 36, 47, 51, 175, 43, 151
    ]

    const shortUncompressed = [
      4, 59, 175, 128, 195, 151, 76, 161, 225, 98, 94, 14, 18, 44, 201, 89, 239, 146, 210,
      217, 55, 214, 36, 173, 12, 61, 207, 171, 215, 150, 107, 123, 15, 198, 214, 244, 171,
      26, 58, 87, 180, 53, 125, 76, 235, 181, 203, 237, 77, 44, 130, 221, 222, 26, 140,
      123, 152, 93, 36, 28, 241, 201, 64, 103
    ]

    expect(() => nimble.functions.decodePublicKey(shortCompressed)).to.throw('too short')
    expect(() => nimble.functions.decodePublicKey(shortUncompressed)).to.throw('too short')
  })
})
