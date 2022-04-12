const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { generatePrivateKey, calculatePublicKey, ecdsaSign, ecdsaVerify, sha256 } = nimble.functions

describe('ecdsaVerify', () => {
  it('valid', () => {
    for (let i = 0; i < 10; i++) {
      const data = 'abc'
      const privateKey = generatePrivateKey()
      const publicKey = calculatePublicKey(privateKey)
      const hash = sha256(Buffer.from(data, 'utf8'))
      const signature = ecdsaSign(hash, privateKey, publicKey)
      expect(ecdsaVerify(signature, hash, publicKey)).to.equal(true)
    }
  })

  it('performance', () => {
    const data = 'abc'
    const privateKey = generatePrivateKey()
    const publicKey = calculatePublicKey(privateKey)
    const hash = sha256(Buffer.from(data, 'utf8'))
    const signatures = []
    const count = 30
    for (let i = 0; i < count; i++) {
      signatures.push(ecdsaSign(hash, privateKey, publicKey))
    }
    const start = new Date()
    for (let i = 0; i < count; i++) {
      ecdsaVerify(signatures[i], hash, publicKey)
    }
    expect((new Date() - start) / count).to.be.lessThan(30)
  })
})
