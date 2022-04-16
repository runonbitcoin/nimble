const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { BufferReader } = nimble.classes

describe('BufferReader', () => {
  describe('constructor', () => {
    it('creates reader', () => {
      const buffer = [0x00, 0x01]
      const reader = new BufferReader(buffer)
      expect(Array.from(reader.buffer)).to.deep.equal(buffer)
      expect(reader.pos).to.equal(0)
    })
  })

  describe('read', () => {
    it('reads buffer', () => {
      expect(Array.from(new BufferReader([]).read(0))).to.deep.equal([])
      expect(Array.from(new BufferReader([0x00, 0x01, 0x02]).read(3))).to.deep.equal([0x00, 0x01, 0x02])
    })

    it('throws if not enough data', () => {
      expect(() => new BufferReader([]).read(1)).to.throw('not enough data')
      expect(() => new BufferReader([0x00]).read(2)).to.throw('not enough data')
      const reader = new BufferReader([0x00])
      reader.read(1)
      expect(() => reader.read(1)).to.throw('not enough data')
    })
  })

  describe('close', () => {
    it('does not throw if read all', () => {
      expect(() => new BufferReader([]).close()).not.to.throw()
      const reader = new BufferReader([0x00, 0x00, 0x00, 0x00])
      reader.read(4)
      expect(() => reader.close()).not.to.throw()
    })

    it('throws if unconsumed data', () => {
      expect(() => new BufferReader([0x00]).close()).to.throw('unconsumed data')
      const reader = new BufferReader([0x00, 0x00, 0x00, 0x00, 0x00])
      reader.read(4)
      expect(() => reader.close()).to.throw('unconsumed data')
    })
  })

  describe('checkRemaining', () => {
    it('throws if not enough data left', () => {
      expect(() => new BufferReader([]).checkRemaining(1)).to.throw('not enough data')
      expect(() => new BufferReader([2]).checkRemaining(2)).to.throw('not enough data')
    })

    it('does not throw if data left', () => {
      expect(() => new BufferReader([]).checkRemaining()).not.to.throw()
      expect(() => new BufferReader([1]).checkRemaining(1)).not.to.throw()
    })
  })
})
