const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { encodePushData } = nimble.functions
const bsv = require('bsv')

describe('encodePushData', () => {
  it('valid', () => {
    function testValid (x) {
      const actual = Array.from(encodePushData(x))
      const expected = Array.from(bsv.Script.fromASM(`${Buffer.from(x).toString('hex')}`).toBuffer())
      expect(actual).to.deep.equal(expected)
    }

    testValid([])
    testValid(new Array(0xFF + 1).fill(0))
  })
})
