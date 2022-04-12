const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { writeU64LE } = nimble.functions
const { BufferWriter } = nimble.classes

describe('writeU64LE', () => {
  it('valid', () => {
    expect(Array.from(writeU64LE(new BufferWriter(), 0).toBuffer()))
      .to.deep.equal([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00])
    expect(Array.from(writeU64LE(new BufferWriter(), Number.MAX_SAFE_INTEGER).toBuffer()))
      .to.deep.equal([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00])
  })

  it('multiple', () => {
    const bw = new BufferWriter()
    writeU64LE(bw, 0)
    writeU64LE(bw, Number.MAX_SAFE_INTEGER)
    expect(Array.from(bw.toBuffer()))
      .to.deep.equal([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00])
  })

  it('throws if too big', () => {
    expect(() => writeU64LE(new BufferWriter(), Number.MAX_SAFE_INTEGER + 1)).to.throw('number too large')
  })
})
