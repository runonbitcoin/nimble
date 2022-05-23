const { describe, it } = require('mocha')
require('chai').use(require('chai-as-promised'))
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { verifyScriptAsync } = nimble.functions

describe('verifyScriptAsync', () => {
  it('promise resolves if script passes and async', async () => {
    await verifyScriptAsync([], [nimble.constants.opcodes.OP_TRUE])
  })

  it('promise is rejected if script fails and async', async () => {
    await expect(verifyScriptAsync([], [nimble.constants.opcodes.OP_FALSE])).to.be.rejected
  })
})
