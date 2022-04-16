const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { generatePrivateKey, calculatePublicKey, verifyPoint } = nimble.functions

describe('validatePublicKey', () => {
  it('valid', () => {
    const privateKey = generatePrivateKey()
    const publicKey = calculatePublicKey(privateKey)
    expect(() => verifyPoint(publicKey)).not.to.throw()
  })

  it('invalid', () => {
    const privateKey = generatePrivateKey()
    const publicKey = calculatePublicKey(privateKey)
    publicKey.y = publicKey.x
    expect(() => verifyPoint(publicKey)).to.throw('invalid point')
  })
})
