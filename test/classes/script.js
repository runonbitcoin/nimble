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
      expect(() => new Script(1)).to.throw('Not a buffer')
      expect(() => new Script({})).to.throw('Not a buffer')
      expect(() => new Script(new Uint16Array())).to.throw('Not a buffer')
    })

    it('may be substituted for a buffer', () => {
      const script = new Script([1, 2, 3])
      expect(script.length).to.equal(3)
      expect(script[0]).to.equal(1)
      expect(script[1]).to.equal(2)
      expect(script[2]).to.equal(3)
      script[1] = 4
      expect(script[1]).to.equal(4)
      expect(script.buffer[1]).to.equal(4)
      expect(Array.from(script)).to.deep.equal([1, 4, 3])
    })
  })
})
