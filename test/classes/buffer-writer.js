const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { BufferWriter } = nimble.classes

describe('BufferWriter', () => {
  describe('constructor', () => {
    it('empty', () => {
      expect(new BufferWriter().toBuffer().length).to.equal(0)
      expect(new BufferWriter().buffers.length).to.equal(0)
      expect(new BufferWriter().length).to.equal(0)
    })
  })

  describe('write', () => {
    it('appends and increases length', () => {
      const writer = new BufferWriter()
      writer.write([0, 1, 2])
      expect(writer.length).to.equal(3)
      writer.write([3])
      expect(writer.length).to.equal(4)
      expect(writer.buffers.length).to.equal(2)
    })
  })

  describe('toBuffer', () => {
    it('concatenates buffers', () => {
      const writer = new BufferWriter()
      writer.write([0, 1, 2, 3])
      writer.write([4])
      writer.write([])
      writer.write([5, 6, 7, 8, 9])
      expect(Array.from(writer.toBuffer())).to.deep.equal([0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
    })
  })
})
