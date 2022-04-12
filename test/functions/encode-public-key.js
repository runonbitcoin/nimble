const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { generatePrivateKey, calculatePublicKey, encodePublicKey } = nimble.functions
const bsv = require('bsv')

describe('encodePublicKey', () => {
  it('valid uncompressed', () => {
    for (let i = 0; i < 100; i++) {
      const privateKey = generatePrivateKey()
      const publicKey = calculatePublicKey(privateKey)
      const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey))
      const bsvPublicKey = new bsv.PublicKey(bsvPrivateKey.toPublicKey().point, { compressed: false })
      const encoded = encodePublicKey(publicKey, false)
      const hex1 = Buffer.from(encoded).toString('hex')
      const hex2 = bsvPublicKey.toString()
      expect(hex1).to.equal(hex2)
    }
  })

  it('valid compressed', () => {
    for (let i = 0; i < 100; i++) {
      const privateKey = generatePrivateKey()
      const publicKey = calculatePublicKey(privateKey)
      const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey))
      const bsvPublicKey = new bsv.PublicKey(bsvPrivateKey.toPublicKey().point, { compressed: true })
      const encoded = encodePublicKey(publicKey)
      const hex1 = Buffer.from(encoded).toString('hex')
      const hex2 = bsvPublicKey.toString()
      expect(hex1).to.equal(hex2)
    }
  })
})
