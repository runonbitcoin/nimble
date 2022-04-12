const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { createP2PKHLockScript } = nimble.functions
const bsv = require('bsv')

describe('createP2PKHLockScript', () => {
  it('valid', () => {
    const mainnetAddress = new bsv.PrivateKey('mainnet').toAddress().toString()
    const mainnetScript = Array.from(bsv.Script.fromAddress(mainnetAddress).toBuffer())
    expect(Array.from(createP2PKHLockScript(mainnetAddress))).to.deep.equal(mainnetScript)
    const testnetAddress = new bsv.PrivateKey('testnet').toAddress().toString()
    const testnetScript = Array.from(bsv.Script.fromAddress(testnetAddress).toBuffer())
    expect(Array.from(createP2PKHLockScript(testnetAddress))).to.deep.equal(testnetScript)
  })

  it('throws if invalid address', () => {
    expect(() => createP2PKHLockScript()).to.throw('not a string')
    expect(() => createP2PKHLockScript(null)).to.throw('not a string')
    expect(() => createP2PKHLockScript(new bsv.PrivateKey().toAddress())).to.throw('not a string')
    expect(() => createP2PKHLockScript('')).to.throw('bad checksum')
  })
})
