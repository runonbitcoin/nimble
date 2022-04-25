const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { decodeAddress, encodeBase58Check } = nimble.functions
const bsv = require('bsv')

describe('decodeAddress', () => {
  it('valid', () => {
    expect(decodeAddress('14kPnFashu7rYZKTXvJU8gXpJMf9e3f8k1')).to.deep.equal({
      testnet: false,
      pubkeyhash: Array.from(new bsv.Address('14kPnFashu7rYZKTXvJU8gXpJMf9e3f8k1').hashBuffer)
    })
    expect(decodeAddress('mhZZFmSiUqcmf8wQrBNjPAVHUCFsHso9ni')).to.deep.equal({
      testnet: true,
      pubkeyhash: Array.from(new bsv.Address('mhZZFmSiUqcmf8wQrBNjPAVHUCFsHso9ni').hashBuffer)
    })
  })

  it('throws if not a string', () => {
    expect(() => decodeAddress()).to.throw('not a string')
    expect(() => decodeAddress([])).to.throw('not a string')
  })

  it('throws if unsupported version', () => {
    expect(() => decodeAddress('3P14159f73E4gFr7JterCCQh9QjiTjiZrG')).to.throw('unsupported version')
  })

  it('throws if bad checksum', () => {
    expect(() => decodeAddress('mhZZFmSiUqcmf8wQrBNjPAVHUCFsHso9n')).to.throw('bad checksum')
  })

  it('throws if unsupported base58', () => {
    expect(() => decodeAddress('@')).to.throw('bad base58 chars')
  })

  it('throws if too short', () => {
    const badLengthAddress = encodeBase58Check(0x00, [])
    expect(() => decodeAddress(badLengthAddress)).to.throw('bad payload')
  })
})
