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

  it('1gb tx', function () {
    this.timeout(3000)
    const tx = { inputs: [], outputs: [] }
    for (let i = 0; i < 1024; i++) {
      tx.outputs.push({ script: new Uint8Array(1 * 1024 * 1024), satoshis: 123 })
    }
    const buffer = encodeTx(tx)
    expect(buffer.length > 1024 * 1024 * 1024).to.equal(true)
  })
})
