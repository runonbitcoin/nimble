const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { generatePrivateKey, calculatePublicKey, validatePublicKey } = nimble.functions

describe('validatePublicKey', () => {
  it('valid', () => {
    const privateKey = generatePrivateKey()
    const publicKey = calculatePublicKey(privateKey)
    expect(validatePublicKey(publicKey)).to.equal(true)
  })

  it('invalid', () => {
    const privateKey = generatePrivateKey()
    const publicKey = calculatePublicKey(privateKey)
    publicKey.y = publicKey.x
    expect(validatePublicKey(publicKey)).to.equal(false)
  })
})
