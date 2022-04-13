const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { areBuffersEqual } = nimble.functions

describe('areBuffersEqual', () => {
  it('retunrs true if same', () => {
    expect(areBuffersEqual([], [])).to.equal(true)
    expect(areBuffersEqual(Buffer.from([]), Buffer.from([]))).to.equal(true)
    expect(areBuffersEqual(Uint8Array.from([]), Uint8Array.from([]))).to.equal(true)
    expect(areBuffersEqual([1, 2, 3], [1, 2, 3])).to.equal(true)
    expect(areBuffersEqual(Buffer.from([1, 2, 3]), Buffer.from([1, 2, 3]))).to.equal(true)
    expect(areBuffersEqual(Uint8Array.from([1, 2, 3]), Uint8Array.from([1, 2, 3]))).to.equal(true)
    expect(areBuffersEqual([], Buffer.from([]))).to.equal(true)
    expect(areBuffersEqual(Buffer.from([]), Uint8Array.from([]))).to.equal(true)
  })

  it('returns false for different lengths', () => {
    expect(areBuffersEqual([], [1])).to.equal(false)
    expect(areBuffersEqual([1], [])).to.equal(false)
    expect(areBuffersEqual([1], [1, 2])).to.equal(false)
  })

  it('returns false for different values', () => {
    expect(areBuffersEqual([1], [21])).to.equal(false)
    expect(areBuffersEqual([1, 2, 3], [1, 2, 4])).to.equal(false)
  })
})
