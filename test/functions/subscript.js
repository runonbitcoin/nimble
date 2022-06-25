const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { Script } = nimble.classes
const { subscript } = nimble.functions

describe('verify subscript', () => {
  it('valid subscripts', () => {
    const asm1 = ''
    const asm2 = 'OP_1 OP_2'
    const asm3 = '0 OP_1 OP_CODESEPARATOR OP_4 OP_5 OP_CODESEPARATOR OP_6 OP_CODESEPARATOR'
    const asm3_0 = 'OP_4 OP_5 OP_CODESEPARATOR OP_6 OP_CODESEPARATOR'
    const asm3_2 = ''
    const script1 = Script.fromASM(asm1)
    const script2 = Script.fromASM(asm2)
    const script3 = Script.fromASM(asm3)
    const script3_0 = Script.fromASM(asm3_0)
    const script3_2 = Script.fromASM(asm3_2)
    expect(subscript(script1, 99)).to.deep.equal(script1)
    expect(subscript(script2, 99)).to.deep.equal(script2)
    expect(subscript(script3, 99)).to.deep.equal(script3)
    expect(subscript(script3, 0)).to.deep.equal(script3_0)
    expect(subscript(script3, 2)).to.deep.equal(script3_2)
  })

  it('bad values', () => {
    const script = new Script()
    const noScript = nimble.PrivateKey.fromRandom()

    expect(() => subscript(script)).to.throw('invalid number')
    expect(() => subscript(script, -1)).to.throw('invalid number')
    expect(() => subscript(noScript, 0)).to.throw('bad script')
  })
})
