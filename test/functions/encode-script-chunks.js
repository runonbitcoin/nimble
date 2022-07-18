const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { Script } = nimble.classes
const { encodeScriptChunks, decodeScriptChunks } = nimble.functions

describe('verify encodeScriptChunks', () => {
  it('valid chunk encoding', () => {
    const asm1 = 'OP_1 OP_2'
    const asm2 = ''
    const script1 = Script.fromASM(asm1)
    const script2 = Script.fromASM(asm2)
    const chunks1 = decodeScriptChunks(script1)
    const chunks2 = decodeScriptChunks(script2)
    expect(encodeScriptChunks(chunks1)).to.deep.equal(script1)
    expect(encodeScriptChunks(chunks2)).to.deep.equal(script2)
  })

  it('bad chunks', () => {
    const chunks1 = 'wrong type'
    const chunks2 = [
      { opcode: 256 }
    ]
    
    expect(() => encodeScriptChunks(chunks1)).to.throw('chunks.map is not a function')
    expect(() => encodeScriptChunks(chunks2)).to.throw('bad hex char')
  })
})
