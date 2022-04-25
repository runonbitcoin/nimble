const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { encodeDER, decodeDER } = nimble.functions

describe('decodeDER', () => {
  it('decodes', () => {
    const signature = { r: new Array(20).fill(1), s: new Array(10).fill(2) }
    const der = encodeDER(signature)
    const signature2 = decodeDER(der)
    expect(Array.from(signature2.r)).to.deep.equal(signature.r)
    expect(Array.from(signature2.s)).to.deep.equal(signature.s)
  })

  it('negative', () => {
    const signature = { r: [0x80].concat(new Array(31).fill(0)), s: new Array(32).fill(255) }
    const der = encodeDER(signature)
    const signature2 = decodeDER(der)
    expect(Array.from(signature2.r)).to.deep.equal(signature.r)
    expect(Array.from(signature2.s)).to.deep.equal(signature.s)
  })

  it('throws if bad der', () => {
    const err = 'bad der'
    expect(() => decodeDER([0x00, 0x04, 0x02, 0, 0x02, 0])).to.throw(err)
    expect(() => decodeDER([0x30, 0x04, 0x03, 0, 0x02, 0])).to.throw(err)
    expect(() => decodeDER([0x30, 0x04, 0x02, 0, 0xFF, 0])).to.throw(err)
    expect(() => decodeDER([0x30, 100, 0x02, 0, 0x02, 0])).to.throw(err)
  })

  it('throws if not enough data', () => {
    const err = 'not enough data'
    expect(() => decodeDER([])).to.throw(err)
    expect(() => decodeDER([0x30])).to.throw(err)
    expect(() => decodeDER([0x30, 0x00])).to.throw(err)
    expect(() => decodeDER([0x30, 0x04, 0x02, 0])).to.throw(err)
    expect(() => decodeDER([0x30, 0x04, 0x02, 0, 0x02, 1])).to.throw(err)
    expect(() => decodeDER([0x30, 0x04, 0x02, 3, 0x02, 1])).to.throw(err)
  })

  it('throws if unconsumed data', () => {
    const err = 'unconsumed data'
    expect(() => decodeDER([0x30, 0x04, 0x02, 0x00, 0x02, 0x00, 0xFF])).to.throw(err)
  })
})
