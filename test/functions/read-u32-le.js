const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { readU32LE } = nimble.functions
const { BufferReader } = nimble.classes

describe('readU32LE', () => {
  it('valid', () => {
    expect(readU32LE(new BufferReader([0x00, 0x00, 0x00, 0x00]))).to.equal(0x00000000)
    expect(readU32LE(new BufferReader([0x01, 0x23, 0x45, 0x67]))).to.equal(0x67452301)
    expect(readU32LE(new BufferReader([0xff, 0xff, 0xff, 0xff]))).to.equal(0xffffffff)
  })

  it('multiple times', () => {
    const reader = new BufferReader([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff])
    expect(readU32LE(reader)).to.equal(0x00000000)
    expect(readU32LE(reader)).to.equal(0xffffffff)
    expect(() => readU32LE(reader)).to.throw('not enough data')
  })

  it('throws if not enough data', () => {
    expect(() => readU32LE(new BufferReader([]))).to.throw('not enough data')
    expect(() => readU32LE(new BufferReader([0x00]))).to.throw('not enough data')
    expect(() => readU32LE(new BufferReader([0x00, 0x00, 0x00]))).to.throw('not enough data')
  })
})
