const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { readU64LE } = nimble.functions
const { BufferReader } = nimble.classes

describe('readU64LE', () => {
  it('valid', () => {
    expect(readU64LE(new BufferReader([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).to.equal(0)
    expect(readU64LE(new BufferReader([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00]))).to.equal(Number.MAX_SAFE_INTEGER)
  })

  it('multiple times', () => {
    const reader = new BufferReader([
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00
    ])
    expect(readU64LE(reader)).to.equal(0x0000000000000000)
    expect(readU64LE(reader)).to.equal(Number.MAX_SAFE_INTEGER)
    expect(() => readU64LE(reader)).to.throw('not enough data')
  })

  it('throws if not enough data', () => {
    expect(() => readU64LE(new BufferReader([]))).to.throw('not enough data')
    expect(() => readU64LE(new BufferReader([0x00]))).to.throw('not enough data')
    expect(() => readU64LE(new BufferReader([0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).to.throw('not enough data')
  })
})
