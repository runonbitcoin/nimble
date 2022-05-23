const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { sighash, decodeHex, decodeTx } = nimble.functions
const { SIGHASH_ALL, SIGHASH_NONE, SIGHASH_SINGLE, SIGHASH_ANYONECANPAY, SIGHASH_FORKID } = nimble.constants.sighashFlags
const bsv = require('bsv')

describe('sighash', () => {
  it('all', async () => {
    const utxo1 = {
      txid: '0000000000000000000000000000000000000000000000000000000000000000',
      vout: 0,
      script: '00',
      satoshis: 1000
    }
    const utxo2 = {
      txid: '1111111111111111111111111111111111111111111111111111111111111111',
      vout: 1,
      script: '01',
      satoshis: 2000
    }
    const addr = new bsv.PrivateKey().toAddress()
    const bsvtx = new bsv.Transaction().from(utxo1).from(utxo2).to(addr, 4000)
    const bsvSighash = bsv.Transaction.Sighash.sighash(bsvtx,
      bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID,
      1, new bsv.Script('01'), new bsv.deps.bnjs.BN(2000)).reverse()
    const tx = decodeTx(decodeHex(bsvtx.toString()))
    const runSighash = await sighash(tx, 1, [0x01], 2000, SIGHASH_ALL | SIGHASH_FORKID)
    expect(bsvSighash).to.deep.equal(runSighash)
  })

  it('none', async () => {
    const utxo = {
      txid: '0000000000000000000000000000000000000000000000000000000000000000',
      vout: 0,
      script: '00',
      satoshis: 1000
    }
    const bsvtx = new bsv.Transaction().from(utxo)
    const bsvSighash = bsv.Transaction.Sighash.sighash(bsvtx,
      bsv.crypto.Signature.SIGHASH_NONE | bsv.crypto.Signature.SIGHASH_FORKID,
      0, new bsv.Script('00'), new bsv.deps.bnjs.BN(1000)).reverse()
    const tx = decodeTx(decodeHex(bsvtx.toString()))
    const runSighash = await sighash(tx, 0, [0x00], 1000, SIGHASH_NONE | SIGHASH_FORKID)
    expect(bsvSighash).to.deep.equal(runSighash)
  })

  it('single', async () => {
    const utxo1 = {
      txid: '0000000000000000000000000000000000000000000000000000000000000000',
      vout: 0,
      script: '00',
      satoshis: 1000
    }
    const utxo2 = {
      txid: '1111111111111111111111111111111111111111111111111111111111111111',
      vout: 1,
      script: '01',
      satoshis: 2000
    }
    const addr = new bsv.PrivateKey().toAddress()
    const bsvtx = new bsv.Transaction().from(utxo1).from(utxo2).to(addr, 4000)
    const bsvSighash = bsv.Transaction.Sighash.sighash(bsvtx,
      bsv.crypto.Signature.SIGHASH_SINGLE | bsv.crypto.Signature.SIGHASH_FORKID,
      0, new bsv.Script('00'), new bsv.deps.bnjs.BN(1000)).reverse()
    const tx = decodeTx(decodeHex(bsvtx.toString()))
    const runSighash = await sighash(tx, 0, [0x00], 1000, SIGHASH_SINGLE | SIGHASH_FORKID)
    expect(bsvSighash).to.deep.equal(runSighash)
  })

  it('anyonecanpay', async () => {
    const utxo = {
      txid: '0000000000000000000000000000000000000000000000000000000000000000',
      vout: 0,
      script: '00',
      satoshis: 1000
    }
    const addr = new bsv.PrivateKey().toAddress()
    const bsvtx = new bsv.Transaction().from(utxo).to(addr, 4000)
    const bsvSighash = bsv.Transaction.Sighash.sighash(bsvtx,
      bsv.crypto.Signature.SIGHASH_SINGLE | bsv.crypto.Signature.SIGHASH_ANYONECANPAY |
        bsv.crypto.Signature.SIGHASH_FORKID, 0, new bsv.Script('00'), new bsv.deps.bnjs.BN(1000)).reverse()
    const tx = decodeTx(decodeHex(bsvtx.toString()))
    const runSighash = await sighash(tx, 0, [0x00], 1000,
      SIGHASH_SINGLE | SIGHASH_ANYONECANPAY | SIGHASH_FORKID)
    expect(bsvSighash).to.deep.equal(runSighash)
  })

  it('supports no sequence, outputs, version, or locktime', async () => {
    const utxo = {
      txid: '0000000000000000000000000000000000000000000000000000000000000000',
      vout: 0,
      script: '00',
      satoshis: 1000
    }
    const bsvtx = new bsv.Transaction().from(utxo)
    const bsvSighash = bsv.Transaction.Sighash.sighash(bsvtx,
      bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID,
      0, new bsv.Script('00'), new bsv.deps.bnjs.BN(1000)).reverse()
    const tx = decodeTx(decodeHex(bsvtx.toString()))
    delete tx.version
    delete tx.inputs[0].sequence
    delete tx.outputs
    delete tx.locktime
    const runSighash = await sighash(tx, 0, [0x00], 1000, SIGHASH_ALL | SIGHASH_FORKID)
    expect(bsvSighash).to.deep.equal(runSighash)
  })

  it('caches hashes', async () => {
    const txns = []
    for (let i = 0; i < 1000; i++) {
      const input = { txid: '0000000000000000000000000000000000000000000000000000000000000000', _vout: 0 }
      const tx = { inputs: [input] }
      txns.push(tx)
    }
    const start1 = new Date()
    for (const tx of txns) {
      await sighash(tx, 0, [0x00], 1000, SIGHASH_ALL | SIGHASH_FORKID)
    }
    const end1 = new Date()
    const start2 = new Date()
    for (const tx of txns) {
      await sighash(tx, 0, [0x00], 1000, SIGHASH_ALL | SIGHASH_FORKID)
    }
    const end2 = new Date()
    expect(end2 - start2 <= end1 - start1).to.equal(true)
  })
})
