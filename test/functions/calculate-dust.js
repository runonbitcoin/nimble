const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { calculateDust } = nimble.functions

describe('calculateDust', () => {
  it('p2pkh', () => {
    expect(calculateDust(25, 1.0)).to.equal(546)
  })

  it('p2pkh with lower relay fee', () => {
    expect(calculateDust(25, 0.5)).to.equal(273)
  })

  it('custom script', () => {
    expect(calculateDust(1000, 1.0)).to.equal(3477)
  })
})
