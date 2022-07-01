const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { sha1 } = nimble.functions
const bsv = require('bsv')

describe('sha1', () => {
  it('empty', () => {
    const data = []
    const expected = Array.from(
      bsv.crypto.Hash.sha1(bsv.deps.Buffer.from(data))
    )
    const actual = Array.from(sha1(data))
    expect(actual).to.deep.equal(expected)
  })

  it('non-empty', () => {
    const data = [1, 2, 3, 4, 5]
    const expected = Array.from(
      bsv.crypto.Hash.sha1(bsv.deps.Buffer.from(data))
    )
    const actual = Array.from(sha1(data))
    expect(actual).to.deep.equal(expected)
  })

  it('performance', () => {
    const start = new Date()
    for (let i = 0; i < 1000; i++) {
      sha1([1, 2, 3, 4, 5])
    }
    const time = new Date() - start
    expect(time < 100).to.equal(true)
  })

  if (nimble.variant === 'undefined' || nimble.variant === 'browser') {
    it('throws if too big', () => {
      const data = new Uint8Array(100 * 1024 * 1024)
      expect(() => sha1(data)).to.throw('data too big')
    })
  }
})
