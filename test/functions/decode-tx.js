const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { decodeTx } = nimble.functions

describe('decodeTx', () => {
  it('throws if not enough data', () => {
    const err = 'not enough data'
    expect(() => decodeTx([])).to.throw(err)
    expect(() => decodeTx([1, 0, 0, 0])).to.throw(err)
    expect(() => decodeTx([1, 0, 0, 0, 0])).to.throw(err)
    expect(() => decodeTx([1, 0, 0, 0, 0, 0])).to.throw(err)
    expect(() => decodeTx([1, 0, 0, 0, 0, 0, 0, 0, 0])).to.throw(err)
  })
})
