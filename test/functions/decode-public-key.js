const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { generatePrivateKey, decodePublicKey, calculatePublicKey } = nimble.functions
const bsv = require('bsv')
const encodePublicKey = require('../../functions/encode-public-key')

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

    const shortXUncompressed = [
      4, 0, 0, 247, 101, 21, 114, 84, 240, 125, 142, 42, 70, 20, 187, 167, 30, 154, 102, 116,
      186, 108, 154, 162, 153, 245, 144, 223, 114, 119, 68, 227, 225, 4, 25, 56, 47, 176, 138,
      32, 38, 87, 75, 61, 34, 122, 13, 60, 115, 162, 151, 72, 163, 123, 96, 174, 112, 190, 9,
      160, 206, 232, 121, 77, 178
    ]

    const shortYUncompressed = [
      4, 59, 175, 128, 195, 151, 76, 161, 225, 98, 94, 14, 18, 44, 201, 89, 239, 146, 210,
      217, 55, 214, 36, 173, 12, 61, 207, 171, 215, 150, 107, 123, 15, 0, 198, 214, 244, 171,
      26, 58, 87, 180, 53, 125, 76, 235, 181, 203, 237, 77, 44, 130, 221, 222, 26, 140,
      123, 152, 93, 36, 28, 241, 201, 64, 103
    ]

    expect(() => decodePublicKey(shortCompressed)).not.to.throw()
    expect(() => decodePublicKey(shortXUncompressed)).not.to.throw()
    expect(() => decodePublicKey(shortYUncompressed)).not.to.throw()
  })

  it('throws if bad prefix', () => {
    const badPrefix = [
      5, 0, 221, 62, 61, 19, 166, 177, 126, 56, 13, 99, 181, 179, 30, 140, 44, 30, 198, 254,
      38, 53, 76, 23, 54, 114, 251, 36, 47, 51, 175, 43, 151
    ]
    expect(() => decodePublicKey(badPrefix)).to.throw('bad prefix')
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

    expect(() => decodePublicKey(shortCompressed)).to.throw('bad length')
    expect(() => decodePublicKey(shortUncompressed)).to.throw('bad length')
  })

  it('throws if too long', () => {
    const longCompressed = [
      2, 0, 221, 62, 61, 19, 166, 177, 126, 56, 13, 99, 181, 179, 30, 140, 44, 30, 198, 254,
      38, 53, 76, 23, 54, 114, 251, 36, 47, 51, 175, 43, 151, 0
    ]

    const longUncompressed = [
      4, 59, 175, 128, 195, 151, 76, 161, 225, 98, 94, 14, 18, 44, 201, 89, 239, 146, 210,
      217, 55, 214, 36, 173, 12, 61, 207, 171, 215, 150, 107, 123, 15, 0, 198, 214, 244, 171,
      26, 58, 87, 180, 53, 125, 76, 235, 181, 203, 237, 77, 44, 130, 221, 222, 26, 140,
      123, 152, 93, 36, 28, 241, 201, 64, 103, 0
    ]

    expect(() => decodePublicKey(longCompressed)).to.throw('bad length')
    expect(() => decodePublicKey(longUncompressed)).to.throw('bad length')
  })

  it('throws if not on curve', () => {
    const privateKey = generatePrivateKey()
    const publicKey = calculatePublicKey(privateKey)
    const badPublicKey = { x: publicKey.x, y: publicKey.x }
    const uncompressed = encodePublicKey(badPublicKey, false)
    expect(() => decodePublicKey(uncompressed)).to.throw('not on curve')
  })

  it('throws if outside range', () => {
    const badPublicKey = { x: new Array(32).fill(0xff), y: new Array(32).fill(0xff) }
    const compressed = encodePublicKey(badPublicKey, true)
    const uncompressed = encodePublicKey(badPublicKey, true)
    expect(() => decodePublicKey(compressed)).to.throw('outside range')
    expect(() => decodePublicKey(uncompressed)).to.throw('outside range')
  })
})
