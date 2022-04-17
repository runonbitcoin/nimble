const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { Script } = nimble

describe('Script', () => {
  describe('constructor', () => {
    it('create script with buffer property', () => {
      const buffer = [1, 2, 3]
      const script = new Script(buffer)
      expect(script.buffer).to.equal(buffer)
    })

    it('defaults to empty buffer if not passed', () => {
      const script = new Script()
      expect(Array.isArray(script.buffer)).to.equal(true)
      expect(script.buffer.length).to.equal(0)
    })

    it('throws if not a buffer', () => {
      expect(() => new Script(1)).to.throw('Cannot create Script: not a buffer')
      expect(() => new Script({})).to.throw('Cannot create Script: not a buffer')
      expect(() => new Script(new Uint16Array())).to.throw('Cannot create Script: not a buffer')
    })

    it('may be substituted for a buffer', () => {
      const script = new Script([1, 2, 3])
      expect(script.length).to.equal(3)
      expect(script[0]).to.equal(1)
      expect(script[1]).to.equal(2)
      expect(script[2]).to.equal(3)
    })
  })

  describe('fromString', () => {
    it('decodes hex', () => {
      expect(Array.from(Script.fromString('000102').buffer)).to.deep.equal([0, 1, 2])
    })

    it('throws if invalid hex', () => {
      expect(() => Script.fromString()).to.throw('Cannot create Script: not a string')
      expect(() => Script.fromString([])).to.throw('Cannot create Script: not a string')
      expect(() => Script.fromString('xyz')).to.throw('Cannot create Script: bad hex char')
    })
  })

  describe('fromHex', () => {
    it('decodes hex', () => {
      expect(Array.from(Script.fromHex('').buffer)).to.deep.equal([])
      expect(Array.from(Script.fromHex('aabbcc').buffer)).to.deep.equal([0xaa, 0xbb, 0xcc])
    })

    it('throws if invalid hex', () => {
      expect(() => Script.fromHex(null)).to.throw('Cannot create Script: not a string')
      expect(() => Script.fromHex('x')).to.throw('Cannot create Script: bad hex char')
    })
  })

  describe('fromBuffer', () => {
    it('creates with buffer', () => {
      expect(Array.from(Script.fromBuffer([]).buffer)).to.deep.equal([])
    })

    it('throws if not a buffer', () => {
      expect(() => Script.fromBuffer()).to.throw('Cannot create Script: not a buffer')
      expect(() => Script.fromBuffer(null)).to.throw('Cannot create Script: not a buffer')
      expect(() => Script.fromBuffer({})).to.throw('Cannot create Script: not a buffer')
    })
  })

  describe('from', () => {
    // TODO
  })

  describe('toString', () => {
    it('encodes hex', () => {
      expect(Script.fromBuffer([]).toString()).to.equal('')
      expect(Script.fromBuffer([0, 1, 2]).toString()).to.equal('000102')
    })
  })

  describe('toHex', () => {
    it('encodes hex', () => {
      expect(Script.fromBuffer([0xff]).toHex()).to.equal('ff')
    })
  })

  describe('toBuffer', () => {
    // TODO
  })

  describe('length', () => {
    // TODO
  })

  describe('slice', () => {
    // TODO
  })

  describe('chunks', () => {
    // TODO
  })
})
