const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { encodeTx, decodeTx } = nimble.functions
const bsv = require('bsv')

describe('encodeTx', () => {
  it('valid', () => {
    function testValid (tx, buffer) {
      expect(Array.from(encodeTx(tx))).to.deep.equal(buffer)
      expect(decodeTx(buffer)).to.deep.equal(tx)
      const bsvtx = new bsv.Transaction()
      if (typeof tx.version !== 'undefined') bsvtx.version = tx.version
      bsvtx.inputs = tx.inputs.map(input => new bsv.Transaction.Input({
        prevTxId: Buffer.from(input.txid, 'hex').reverse(),
        outputIndex: input.vout,
        script: Buffer.from(input.script).toString('hex'),
        sequenceNumber: input.sequence
      }))
      bsvtx.outputs = tx.outputs.map(output => new bsv.Transaction.Output({
        script: Buffer.from(output.script).toString('hex'),
        satoshis: output.satoshis
      }))
      if (typeof tx.locktime !== 'undefined') bsvtx.nLockTime = tx.locktime
      expect(bsvtx.toString()).to.equal(Buffer.from(buffer).toString('hex'))
    }

    const a = '0000000000000000000000000000000000000000000000000000000000000000'
    const abuffer = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    const b = '0101010101010101010101010101010101010101010101010101010101010101'
    const bbuffer = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    const longScript = []
    for (let i = 0; i < 256; i++) longScript.push(0x00)

    testValid(
      { version: 0, inputs: [], outputs: [], locktime: 0 },
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    testValid(
      { version: 1, inputs: [], outputs: [], locktime: 0 },
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    testValid(
      { version: 0, inputs: [], outputs: [], locktime: 1 },
      [0, 0, 0, 0, 0, 0, 1, 0, 0, 0])
    testValid(
      { version: 1, inputs: [{ txid: a, vout: 0, script: [], sequence: 0xffffffff }], outputs: [], locktime: 0 },
      [1, 0, 0, 0, 1].concat(abuffer).concat([0, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0]))
    testValid(
      { version: 1, inputs: [{ txid: a, vout: 0, script: [], sequence: 0xffffffff }], outputs: [], locktime: 0 },
      [1, 0, 0, 0, 1].concat(abuffer).concat([0, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0]))
    testValid(
      { version: 1, inputs: [{ txid: a, vout: 0, script: [], sequence: 0xffffffff }, { txid: b, vout: 1, script: [], sequence: 0xffffffff }], outputs: [], locktime: 0 },
      [1, 0, 0, 0, 2].concat(abuffer).concat([0, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff]).concat(bbuffer).concat([1, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0]))
    testValid(
      { version: 1, inputs: [{ txid: a, vout: 0, script: [0xdd, 0xee, 0xff], sequence: 0xffffffff }], outputs: [], locktime: 0 },
      [1, 0, 0, 0, 1].concat(abuffer).concat([0, 0, 0, 0, 3, 0xdd, 0xee, 0xff, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0]))
    testValid(
      { version: 1, inputs: [], outputs: [{ satoshis: 0, script: [] }], locktime: 0 },
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    testValid(
      { version: 1, inputs: [], outputs: [{ satoshis: 1, script: [] }], locktime: 0 },
      [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    testValid(
      { version: 1, inputs: [], outputs: [{ satoshis: 0, script: [0xff] }], locktime: 0 },
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0xff, 0, 0, 0, 0])
    testValid(
      { version: 1, inputs: [], outputs: [{ satoshis: 0, script: longScript }], locktime: 0 },
      [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0xfd, 0x00, 0x01].concat(longScript).concat([0, 0, 0, 0]))
    testValid(
      { version: 1, inputs: [], outputs: [{ satoshis: 0, script: [0xff] }, { satoshis: 1, script: [0xee] }], locktime: 0 },
      [1, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0xff, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0xee, 0, 0, 0, 0])
  })

  it('supports optional version', () => {
    expect(Array.from(encodeTx(
      { inputs: [], outputs: [], locktime: 0 }
    ))).to.deep.equal(
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
  })

  it('supports optional inputs', () => {
    expect(Array.from(encodeTx(
      { version: 1, outputs: [], locktime: 0 }
    ))).to.deep.equal(
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
  })

  it('supports optional outputs', () => {
    expect(Array.from(encodeTx(
      { version: 1, inputs: [], locktime: 0 }
    ))).to.deep.equal(
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
  })

  it('supports optional locktime', () => {
    expect(Array.from(encodeTx(
      { version: 1, inputs: [], outputs: [] }
    ))).to.deep.equal(
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    )
  })

  it('supports optional sequence', () => {
    const a = '0000000000000000000000000000000000000000000000000000000000000000'
    const abuffer = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    expect(Array.from(encodeTx(
      { version: 1, inputs: [{ txid: a, vout: 0, script: [] }], outputs: [], locktime: 0 }
    ))).to.deep.equal(
      [1, 0, 0, 0, 1].concat(abuffer).concat([0, 0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff, 0, 0, 0, 0, 0])
    )
  })
})
