const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { writePushData } = nimble.functions
const { BufferWriter } = nimble.classes
const bsv = require('bsv')

describe('writePushData', () => {
  it('valid', () => {
    function testValid (x) {
      const actual = Array.from(writePushData(new BufferWriter(), x).toBuffer())
      const expected = Array.from(bsv.Script.fromASM(`${Buffer.from(x).toString('hex')}`).toBuffer())
      expect(actual).to.deep.equal(expected)
    }

    testValid([])
    testValid([1])
    testValid(new Array(0xFF).fill(0))
    testValid(new Array(0xFF + 1).fill(0))
    testValid(new Array(0xFFFF).fill(0))
    testValid(new Array(0xFFFF + 1).fill(0))
  })

  it('throws if data too big', () => {
    const bigBuffer = Buffer.alloc(0)
    Object.defineProperty(bigBuffer, 'length', () => 0xFFFFFFFF + 1)
    expect(() => writePushData(new BufferWriter(), bigBuffer)).to.throw('data too large')
  })
})
