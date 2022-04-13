const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { generateRandomData } = nimble.functions

describe('generateRandomData', () => {
  it('returns random data', () => {
    const buf1 = generateRandomData(1000)
    const buf2 = generateRandomData(1000)
    expect(buf1.length).to.equal(buf2.length)
    expect(buf1.length).to.equal(1000)
    expect(Array.from(buf1)).not.to.deep.equal(Array.from(buf2))
  })
})
