const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { generatePrivateKey, calculatePublicKey } = nimble.functions
const bsv = require('bsv')

describe('calculatePublicKey', () => {
  it('valid', () => {
    for (let i = 0; i < 100; i++) {
      const privateKey = generatePrivateKey()
      const publicKey = calculatePublicKey(privateKey)
      const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey))
      const bsvPublicKey = bsvPrivateKey.toPublicKey()
      const xhex1 = Buffer.from(publicKey.x).toString('hex')
      const xhex2 = bsvPublicKey.point.getX().toBuffer().toString('hex')
      const yhex1 = Buffer.from(publicKey.y).toString('hex')
      const yhex2 = bsvPublicKey.point.getY().toBuffer().toString('hex')
      expect(xhex1).to.equal(xhex2)
      expect(yhex1).to.equal(yhex2)
    }
  })

  it('performance', () => {
    const privateKey = generatePrivateKey()
    let count = 0
    const start = new Date()
    while (new Date() - start < 1000) {
      calculatePublicKey(privateKey)
      count++
    }
    const msPerCall = 1000 / count
    expect(msPerCall).to.be.lessThan(10)
  })
})
