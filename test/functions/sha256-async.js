const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { sha256Async } = nimble.functions
const bsv = require('bsv')

describe('ripemd160Async', () => {
  it('empty', async () => {
    const data = []
    const expected = Array.from(bsv.crypto.Hash.sha256(bsv.deps.Buffer.from(data)))
    const actual = Array.from(await sha256Async(data))
    expect(actual).to.deep.equal(expected)
  })
})
