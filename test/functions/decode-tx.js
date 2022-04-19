const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { decodeTx, encodeTx } = nimble.functions

describe('decodeTx', () => {
  it('twice of buffer returns same value', () => {
    const tx = {
      version: 1,
      inputs: [
        {
          txid: '1234567812345678123456781234567812345678123456781234567812345678',
          vout: 1,
          script: [1, 2, 3],
          sequence: 88
        }
      ],
      outputs: [
        {
          script: [4, 5, 6],
          satoshis: 7
        }
      ],
      locktime: 100
    }
    const buffer = Buffer.from(encodeTx(tx))
    const tx1 = decodeTx(buffer)
    const tx2 = decodeTx(buffer)
    expect(tx1).to.deep.equal(tx2)
  })

  it('throws if not enough data', () => {
    const err = 'not enough data'
    expect(() => decodeTx([])).to.throw(err)
    expect(() => decodeTx([1, 0, 0, 0])).to.throw(err)
    expect(() => decodeTx([1, 0, 0, 0, 0])).to.throw(err)
    expect(() => decodeTx([1, 0, 0, 0, 0, 0])).to.throw(err)
    expect(() => decodeTx([1, 0, 0, 0, 0, 0, 0, 0, 0])).to.throw(err)
  })
})
