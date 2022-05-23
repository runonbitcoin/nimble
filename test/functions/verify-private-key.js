const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { verifyPrivateKey, generatePrivateKey } = nimble.functions

describe('verifyPrivateKey', () => {
  it('does not throw for valid key', () => {
    verifyPrivateKey(generatePrivateKey())
  })

  it('throws if bad length', () => {
    expect(() => verifyPrivateKey([])).to.throw('bad length')
    expect(() => verifyPrivateKey(new Array(33))).to.throw('bad length')
  })

  it('throws if out of range', () => {
    expect(() => verifyPrivateKey(new Array(32).fill(255))).to.throw('outside range')
  })
})
