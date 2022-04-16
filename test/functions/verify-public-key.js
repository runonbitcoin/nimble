const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { generatePrivateKey, calculatePublicKey, verifyPublicKey } = nimble.functions

describe('validatePublicKey', () => {
  it('valid', () => {
    const privateKey = generatePrivateKey()
    const publicKey = calculatePublicKey(privateKey)
    expect(() => verifyPublicKey(publicKey)).not.to.throw()
  })

  it('invalid', () => {
    const privateKey = generatePrivateKey()
    const publicKey = calculatePublicKey(privateKey)
    publicKey.y = publicKey.x
    expect(() => verifyPublicKey(publicKey)).to.throw('invalid point')
  })
})
