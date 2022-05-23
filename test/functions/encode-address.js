const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { encodeAddress } = nimble.functions
const bsv = require('bsv')

describe('encodeAddress', () => {
  it('valid', () => {
    const pubkeyhash = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]
    const bsvMainnetAddress = bsv.Address.fromPublicKeyHash(bsv.deps.Buffer.from(pubkeyhash), 'mainnet')
    const bsvTestnetAddress = bsv.Address.fromPublicKeyHash(bsv.deps.Buffer.from(pubkeyhash), 'testnet')
    expect(encodeAddress(pubkeyhash, false)).to.equal(bsvMainnetAddress.toString())
    expect(encodeAddress(pubkeyhash, true)).to.equal(bsvTestnetAddress.toString())
  })
})
