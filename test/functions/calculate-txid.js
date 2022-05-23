const { describe, it } = require('mocha')
const nimble = require('../env/nimble')
const { calculateTxid, encodeTx, encodeHex } = nimble.functions
const bsv = require('bsv')
const { expect } = require('chai')

describe('calculateTxid', () => {
  it('calculates txid', () => {
    const tx = { inputs: [], outputs: [{ script: [], satoshis: 100 }] }
    const bsvtx = new bsv.Transaction(encodeHex(encodeTx(tx)))
    const txid = calculateTxid(encodeTx(tx))
    expect(txid).to.equal(bsvtx.hash)
  })
})
