const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { writePushData } = nimble.functions
const { BufferWriter } = nimble.classes

describe('writePushData', () => {
  it('valid', () => {
    function testValid (x, y) {
      const actual = Array.from(writePushData(new BufferWriter(), x).toBuffer())
      expect(Array.from(actual)).to.deep.equal(y)
    }

    testValid([], [0])
    testValid([0], [1, 0])
    testValid([0, 0], [2, 0, 0])
    testValid([1], [1, 1])
    testValid([16], [1, 16])
    testValid(new Array(0xFF).fill(0), [76, 255].concat(new Array(0xFF).fill(0)))
    testValid(new Array(0xFF + 1).fill(0), [77, 0, 1].concat(new Array(0xFF + 1).fill(0)))
    testValid(new Array(0xFFFF).fill(0), [77, 255, 255].concat(new Array(0xFFFF).fill(0)))
    testValid(new Array(0xFFFF + 1).fill(0), [78, 0, 0, 1, 0].concat(new Array(0xFFFF + 1).fill(0)))
  })

  it('throws if data too big', () => {
    const bigBuffer = Buffer.alloc(0)
    Object.defineProperty(bigBuffer, 'length', () => 0xFFFFFFFF + 1)
    expect(() => writePushData(new BufferWriter(), bigBuffer)).to.throw('data too large')
  })
})
