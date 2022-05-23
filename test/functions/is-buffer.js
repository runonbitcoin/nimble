const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { isBuffer } = nimble.functions

describe('isBuffer', () => {
  it('returns true for buffer', () => {
    expect(isBuffer([])).to.equal(true)
    expect(isBuffer(Buffer.from([]))).to.equal(true)
    expect(isBuffer(new Uint8Array([]))).to.equal(true)
  })

  it('returns false for non-buffer', () => {
    expect(isBuffer()).to.equal(false)
    expect(isBuffer({})).to.equal(false)
    expect(isBuffer(Uint16Array.from([]))).to.equal(false)
  })

  it('returns false non-byte elements', () => {
    expect(isBuffer(['a'])).to.equal(false)
    expect(isBuffer([1, undefined])).to.equal(false)
  })
})
