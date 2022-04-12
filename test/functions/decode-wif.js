const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { encodeWIF, decodeWIF, generatePrivateKey, encodeBase58Check } = nimble.functions

describe('decodeWIF', () => {
  it('uncompressed', () => {
    const privateKey = generatePrivateKey()
    const testnet = Math.random() < 0.5
    const compressed = false
    const wif = encodeWIF(privateKey, testnet, compressed)
    const decoded = decodeWIF(wif)
    expect([...decoded.number]).to.deep.equal([...privateKey])
    expect(decoded.testnet).to.equal(testnet)
    expect(decoded.compressed).to.equal(false)
  })

  it('compressed', () => {
    const privateKey = generatePrivateKey()
    const testnet = Math.random() < 0.5
    const compressed = true
    const wif = encodeWIF(privateKey, testnet, compressed)
    const decoded = decodeWIF(wif)
    expect([...decoded.number]).to.deep.equal([...privateKey])
    expect(decoded.testnet).to.equal(testnet)
    expect(decoded.compressed).to.equal(true)
  })

  it('throws if too short', () => {
    const invalidLengthWIF = encodeBase58Check(0x80, [])
    expect(() => decodeWIF(invalidLengthWIF)).to.throw('bad payload')
  })
})
