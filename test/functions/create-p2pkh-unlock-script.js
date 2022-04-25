const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { createP2PKHUnlockScript } = nimble.functions

describe('createP2PKHUnlockScript', () => {
  it('valid', () => {
    const sig = new Array(71).fill(1)
    const pubkey = new Array(33).fill(2)
    expect(Array.from(createP2PKHUnlockScript(sig, pubkey))).to.deep.equal([71, ...sig, 33, ...pubkey])
  })

  it('throws if bad address', () => {
    expect(() => createP2PKHUnlockScript()).to.throw()
    expect(() => createP2PKHUnlockScript(null)).to.throw()
    expect(() => createP2PKHUnlockScript([])).to.throw()
  })
})
