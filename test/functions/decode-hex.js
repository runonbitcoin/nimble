const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { decodeHex } = nimble.functions

describe('decodeHex', () => {
  it('empty', () => {
    expect(Array.from(decodeHex(''))).to.deep.equal([])
  })

  it('buffer', () => {
    expect(Array.from(decodeHex('001122'))).to.deep.equal([0x00, 0x11, 0x22])
  })

  it('incomplete', () => {
    expect(Array.from(decodeHex('102'))).to.deep.equal([0x01, 0x02])
  })
})
