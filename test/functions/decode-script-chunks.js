const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { decodeScriptChunks } = nimble.functions
const bsv = require('bsv')

describe('decodeScriptChunks', () => {
  it('valid', () => {
    function test (script, chunks) {
      expect(decodeScriptChunks(script)).to.deep.equal(chunks)
      const bsvScript = bsv.Script.fromBuffer(bsv.deps.Buffer.from(script))
      expect(bsvScript.chunks.length).to.equal(chunks.length)
      chunks.forEach((chunk, i) => {
        expect(chunk.opcode).to.equal(bsvScript.chunks[i].opcodenum)
        // We treat OP_0 special and do store an empty buffer to match writePushData behavior
        if (chunk.opcode !== 0) {
          expect(chunk.buf || []).to.deep.equal(Array.from(bsvScript.chunks[i].buf || []))
        }
      })
    }

    test([], [])
    test([100, 255], [{ opcode: 100 }, { opcode: 255 }])
    test([0], [{ opcode: 0, buf: [] }])
    test([1, 2], [{ opcode: 1, buf: [2] }])
    test([75, ...new Array(75).fill(1)], [{ opcode: 75, buf: new Array(75).fill(1) }])
    test([76, 76, ...new Array(76).fill(1)], [{ opcode: 76, buf: new Array(76).fill(1) }])
    test([76, 0xFF, ...new Array(0xFF).fill(1)], [{ opcode: 76, buf: new Array(0xFF).fill(1) }])
    test([77, 0, 1, ...new Array(0xFF + 1).fill(1)], [{ opcode: 77, buf: new Array(0xFF + 1).fill(1) }])
    test([77, 0xFF, 0xFF, ...new Array(0xFFFF).fill(1)], [{ opcode: 77, buf: new Array(0xFFFF).fill(1) }])
    test([78, 0, 0, 1, 0, ...new Array(0xFFFF + 1).fill(1)], [{ opcode: 78, buf: new Array(0xFFFF + 1).fill(1) }])
    test([79], [{ opcode: 79 }])
    test([80], [{ opcode: 80 }])
    test([81], [{ opcode: 81 }])
    test([96], [{ opcode: 96 }])
    test([100, 255, 1, 2], [{ opcode: 100 }, { opcode: 255 }, { opcode: 1, buf: [2] }])
  })

  it('throws if bad', () => {
    const err = 'bad script'
    expect(() => decodeScriptChunks([1])).to.throw(err)
    expect(() => decodeScriptChunks([75])).to.throw(err)
    expect(() => decodeScriptChunks([76])).to.throw(err)
    expect(() => decodeScriptChunks([76, 1])).to.throw(err)
    expect(() => decodeScriptChunks([77, 0])).to.throw(err)
    expect(() => decodeScriptChunks([77, 1, 0])).to.throw(err)
    expect(() => decodeScriptChunks([78, 0])).to.throw(err)
    expect(() => decodeScriptChunks([78, 0, 0, 0])).to.throw(err)
    expect(() => decodeScriptChunks([78, 1, 0, 0, 0])).to.throw(err)
  })
})
