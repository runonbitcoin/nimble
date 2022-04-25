const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { decodeBase64 } = nimble.functions

describe('decodeBase64', () => {
  it('decodes', () => {
    expect(Array.from(decodeBase64(''))).to.deep.equal(Array.from(Buffer.from('')))
    expect(Array.from(decodeBase64('YQ=='))).to.deep.equal(Array.from(Buffer.from('a')))
    expect(Array.from(decodeBase64('YWI='))).to.deep.equal(Array.from(Buffer.from('ab')))
    expect(Array.from(decodeBase64('YWJj'))).to.deep.equal(Array.from(Buffer.from('abc')))
    expect(Array.from(decodeBase64('YWJjZGVmZw=='))).to.deep.equal(Array.from(Buffer.from('abcdefg')))
    expect(Array.from(decodeBase64('YWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5'))).to.deep.equal(Array.from(Buffer.from('abcdefghijklmnopqrstuvwxyz0123456789')))
  })

  it('throws if bad', () => {
    expect(() => decodeBase64('1')).to.throw('length must be a multiple of 4')
    expect(() => decodeBase64('abc')).to.throw('length must be a multiple of 4')
  })
})
