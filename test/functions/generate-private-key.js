const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { generatePrivateKey } = nimble.functions
const bsv = require('bsv')

describe('generatePrivateKey', () => {
  it('valid', () => {
    for (let i = 0; i < 100; i++) {
      const privateKey = generatePrivateKey()
      const bsvPrivateKey = bsv.PrivateKey.fromBuffer(bsv.deps.Buffer.from(privateKey))
      bsvPrivateKey.toPublicKey()
      expect(Buffer.from(privateKey).toString('hex')).to.equal(bsvPrivateKey.toBuffer().toString('hex'))
    }
  })

  it('performance', () => {
    generatePrivateKey()
    let count = 0
    const start = new Date()
    while (new Date() - start < 100) {
      generatePrivateKey()
      count++
    }
    const msPerCall = 1000 / count
    expect(msPerCall).to.be.lessThan(1)
  })
})
