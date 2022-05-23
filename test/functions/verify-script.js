const { describe, it } = require('mocha')
require('chai').use(require('chai-as-promised'))
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { verifyScript } = nimble.functions

describe('verifyScript', () => {
  it('does not throw if script passes', () => {
    expect(() => verifyScript([], [nimble.constants.opcodes.OP_TRUE])).not.to.throw()
  })

  it('throws if script fails', () => {
    expect(() => verifyScript([], [nimble.constants.opcodes.OP_FALSE])).to.throw()
  })

  it('promise resolves if script passes and async', async () => {
    await verifyScript([], [nimble.constants.opcodes.OP_TRUE], undefined, undefined, undefined, true)
  })

  it('promise is rejected if script fails and async', async () => {
    await expect(verifyScript([], [nimble.constants.opcodes.OP_FALSE], undefined, undefined, undefined, true)).to.be.rejected
  })
})
