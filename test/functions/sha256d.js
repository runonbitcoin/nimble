const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { sha256d } = nimble.functions
const bsv = require('bsv')

describe('sha256', () => {
  it('valid', () => {
    const data = [1, 2, 3]
    const expected = Array.from(bsv.crypto.Hash.sha256(bsv.crypto.Hash.sha256(bsv.deps.Buffer.from(data))))
    const actual = Array.from(sha256d(data))
    expect(actual).to.deep.equal(expected)
  })
})
