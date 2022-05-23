const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { createP2PKHLockScript } = nimble.functions
const bsv = require('bsv')

describe('createP2PKHLockScript', () => {
  it('valid', () => {
    const mainnetAddress = nimble.PrivateKey.fromRandom(false).toAddress()
    const mainnetScript = Array.from(bsv.Script.fromAddress(mainnetAddress.toString()).toBuffer())
    expect(Array.from(createP2PKHLockScript(mainnetAddress.pubkeyhash))).to.deep.equal(mainnetScript)
    const testnetAddress = nimble.PrivateKey.fromRandom(true).toAddress()
    const testnetScript = Array.from(bsv.Script.fromAddress(testnetAddress.toString()).toBuffer())
    expect(Array.from(createP2PKHLockScript(testnetAddress.pubkeyhash))).to.deep.equal(testnetScript)
  })

  it('throws if bad address', () => {
    expect(() => createP2PKHLockScript()).to.throw('not a buffer')
    expect(() => createP2PKHLockScript(null)).to.throw('not a buffer')
    expect(() => createP2PKHLockScript(new bsv.PrivateKey().toAddress())).to.throw('not a buffer')
    expect(() => createP2PKHLockScript('')).to.throw('not a buffer')
  })
})
