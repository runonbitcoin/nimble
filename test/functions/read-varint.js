const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { readVarint } = nimble.functions
const { BufferReader } = nimble.classes

describe('readVarint', () => {
  it('valid', () => {
    expect(readVarint(new BufferReader([0]))).to.equal(0)
    expect(readVarint(new BufferReader([252]))).to.equal(252)
    expect(readVarint(new BufferReader([0xfd, 0x00, 0x00]))).to.equal(0)
    expect(readVarint(new BufferReader([0xfd, 0xfd, 0x00]))).to.equal(253)
    expect(readVarint(new BufferReader([0xfd, 0xff, 0x00]))).to.equal(255)
    expect(readVarint(new BufferReader([0xfd, 0x00, 0x01]))).to.equal(256)
    expect(readVarint(new BufferReader([0xfd, 0xfe, 0xff]))).to.equal(0xfffe)
    expect(readVarint(new BufferReader([0xfe, 0x00, 0x00, 0x00, 0x00]))).to.equal(0)
    expect(readVarint(new BufferReader([0xfe, 0xfc, 0xfd, 0xfe, 0xff]))).to.equal(0xfffefdfc)
    expect(readVarint(new BufferReader([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).to.equal(0)
    expect(readVarint(new BufferReader([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00]))).to.equal(Number.MAX_SAFE_INTEGER)
  })

  it('multiple times', () => {
    const reader = new BufferReader([0x00, 0x01, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x1f, 0x00])
    expect(readVarint(reader)).to.equal(0)
    expect(readVarint(reader)).to.equal(1)
    expect(readVarint(reader)).to.equal(Number.MAX_SAFE_INTEGER)
    expect(() => readVarint(reader)).to.throw('not enough data')
  })

  it('throws if too big', () => {
    expect(() => readVarint(new BufferReader([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0x20, 0x00]))).to.throw('varint too large')
    expect(() => readVarint(new BufferReader([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))).to.throw('varint too large')
  })

  it('throws if not enough data', () => {
    const err = 'not enough data'
    expect(() => readVarint(new BufferReader([]))).to.throw(err)
    expect(() => readVarint(new BufferReader([0xfd]))).to.throw(err)
    expect(() => readVarint(new BufferReader([0xfd, 0x00]))).to.throw(err)
    expect(() => readVarint(new BufferReader([0xfe, 0x00]))).to.throw(err)
    expect(() => readVarint(new BufferReader([0xfe, 0x00, 0x00, 0x00]))).to.throw(err)
    expect(() => readVarint(new BufferReader([0xff, 0x00]))).to.throw(err)
    expect(() => readVarint(new BufferReader([0xff, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]))).to.throw(err)
    expect(() => readVarint(new BufferReader([0xff, 0x00]))).to.throw(err)
  })
})
