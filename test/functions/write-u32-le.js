const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { writeU32LE } = nimble.functions
const { BufferWriter } = nimble.classes

describe('writeU32LE', () => {
  it('valid', () => {
    expect(Array.from(writeU32LE(new BufferWriter(), 0).toBuffer())).to.deep.equal([0x00, 0x00, 0x00, 0x00])
    expect(Array.from(writeU32LE(new BufferWriter(), 0x01234567).toBuffer())).to.deep.equal([0x67, 0x45, 0x23, 0x01])
    expect(Array.from(writeU32LE(new BufferWriter(), 0xffffffff).toBuffer())).to.deep.equal([0xff, 0xff, 0xff, 0xff])
  })

  it('multiple', () => {
    const bw = new BufferWriter()
    writeU32LE(bw, 0x00000000)
    writeU32LE(bw, 0xffffffff)
    expect(Array.from(bw.toBuffer())).to.deep.equal([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff])
  })

  it('throws if too big', () => {
    expect(() => writeU32LE(new BufferWriter(), 0xffffffff + 1)).to.throw('number too large')
  })
})
