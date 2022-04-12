const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { encodeWIF, generatePrivateKey } = nimble.functions
const bsv = require('bsv')

describe('encodeWIF', () => {
  it('uncompressed', () => {
    for (let i = 0; i < 100; i++) {
      const privateKey = generatePrivateKey()
      const wif = encodeWIF(privateKey, false, false)
      expect([...new bsv.PrivateKey(wif).toBuffer()]).to.deep.equal([...privateKey])
    }
  })

  it('compressed', () => {
    for (let i = 0; i < 100; i++) {
      const privateKey = generatePrivateKey()
      const wif = encodeWIF(privateKey, true, true)
      expect([...new bsv.PrivateKey(wif).toBuffer()]).to.deep.equal([...privateKey])
    }
  })
})
