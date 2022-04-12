const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { encodeHex } = nimble.functions

describe('encodeHex', () => {
  it('empty', () => {
    expect(encodeHex([])).to.equal('')
  })

  it('buffer', () => {
    expect(encodeHex([0x00, 0x11, 0x22])).to.equal('001122')
  })
})
