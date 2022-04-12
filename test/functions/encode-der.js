const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { encodeDER, decodeDER, generateRandomData } = nimble.functions
const bsv = require('bsv')

describe('encodeDER', () => {
  it('encodes full length', () => {
    const signature = { r: new Array(32).fill(1), s: new Array(32).fill(2) }
    const der = encodeDER(signature)
    expect(der[0]).to.equal(0x30)
    expect(der[1]).to.equal(68)
    expect(der[2]).to.equal(0x02)
    expect(der[3]).to.equal(32)
    expect(Array.from(der.slice(4, 4 + 32))).to.deep.equal(signature.r)
    expect(der[36]).to.equal(0x02)
    expect(der[37]).to.equal(32)
    expect(Array.from(der.slice(38))).to.deep.equal(signature.s)
    const bsvSignature = bsv.crypto.Signature.fromDER(bsv.deps.Buffer.from(der))
    expect(Array.from(bsvSignature.r.toBuffer())).to.deep.equal(signature.r)
    expect(Array.from(bsvSignature.s.toBuffer())).to.deep.equal(signature.s)
  })

  it('encodes smaller length', () => {
    const signature = { r: new Array(20).fill(1), s: new Array(10).fill(2) }
    const der = encodeDER(signature)
    expect(der[0]).to.equal(0x30)
    expect(der[1]).to.equal(34)
    expect(der[2]).to.equal(0x02)
    expect(der[3]).to.equal(20)
    expect(Array.from(der.slice(4, 4 + 20))).to.deep.equal(signature.r)
    expect(der[24]).to.equal(0x02)
    expect(der[25]).to.equal(10)
    expect(Array.from(der.slice(26))).to.deep.equal(signature.s)
    const bsvSignature = bsv.crypto.Signature.fromDER(bsv.deps.Buffer.from(der))
    expect(Array.from(bsvSignature.r.toBuffer())).to.deep.equal(signature.r)
    expect(Array.from(bsvSignature.s.toBuffer())).to.deep.equal(signature.s)
  })

  it('negative', () => {
    const signature = { r: [0x80].concat(new Array(31).fill(0)), s: new Array(32).fill(255) }
    const der = encodeDER(signature)
    expect(der[0]).to.equal(0x30)
    expect(der[1]).to.equal(70)
    expect(der[2]).to.equal(0x02)
    expect(der[3]).to.equal(33)
    expect(der[4]).to.equal(0x00)
    expect(Array.from(der.slice(5, 5 + 32))).to.deep.equal(signature.r)
    expect(der[37]).to.equal(0x02)
    expect(der[38]).to.equal(33)
    expect(der[39]).to.equal(0x00)
    expect(Array.from(der.slice(40, 40 + 32))).to.deep.equal(signature.s)
  })

  it('matches bsv lib', () => {
    for (let i = 0; i < 100; i++) {
      let r = generateRandomData(32)
      while (r[0] === 0) { r = r.slice(1) }

      let s = generateRandomData(32)
      while (s[0] === 0) { s = s.slice(1) }

      const signature = { r, s }
      const der = encodeDER(signature)

      const rbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.r))
      const sbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.s))
      const bsvSignature = new bsv.crypto.Signature(rbn, sbn)
      const bsvder = bsvSignature.toDER()

      expect(Array.from(der)).to.deep.equal(Array.from(bsvder))
      expect(Array.from(decodeDER(der).r)).to.deep.equal(Array.from(r))
      expect(Array.from(decodeDER(der).s)).to.deep.equal(Array.from(s))
    }
  })
})
