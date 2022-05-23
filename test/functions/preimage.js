const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { preimage, decodeHex, decodeTx } = nimble.functions
const { SIGHASH_ALL, SIGHASH_NONE, SIGHASH_SINGLE, SIGHASH_ANYONECANPAY, SIGHASH_FORKID } = nimble.constants.sighashFlags
const bsv = require('bsv')

describe('preimage', () => {
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
    const bsvPreimageBuf = bsv.Transaction.Sighash.sighashPreimage(bsvtx,
      bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID,
      1, new bsv.Script('01'), new bsv.deps.bnjs.BN(2000))
    const bsvPreimage = new Uint8Array(bsvPreimageBuf.buffer, bsvPreimageBuf.byteOffset, bsvPreimageBuf.byteLength)
    const tx = decodeTx(decodeHex(bsvtx.toString()))
    const runPreimage = await preimage(tx, 1, [0x01], 2000, SIGHASH_ALL | SIGHASH_FORKID)
    expect(bsvPreimage).to.deep.equal(runPreimage)
  })

  it('none', async () => {
    const utxo = {
      txid: '0000000000000000000000000000000000000000000000000000000000000000',
      vout: 0,
      script: '00',
      satoshis: 1000
    }
    const bsvtx = new bsv.Transaction().from(utxo)
    const bsvPreimageBuf = bsv.Transaction.Sighash.sighashPreimage(bsvtx,
      bsv.crypto.Signature.SIGHASH_NONE | bsv.crypto.Signature.SIGHASH_FORKID,
      0, new bsv.Script('00'), new bsv.deps.bnjs.BN(1000))
    const bsvPreimage = new Uint8Array(bsvPreimageBuf.buffer, bsvPreimageBuf.byteOffset, bsvPreimageBuf.byteLength)
    const tx = decodeTx(decodeHex(bsvtx.toString()))
    const runPreimage = await preimage(tx, 0, [0x00], 1000, SIGHASH_NONE | SIGHASH_FORKID)
    expect(bsvPreimage).to.deep.equal(runPreimage)
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
    const bsvPreimageBuf = bsv.Transaction.Sighash.sighashPreimage(bsvtx,
      bsv.crypto.Signature.SIGHASH_SINGLE | bsv.crypto.Signature.SIGHASH_FORKID,
      0, new bsv.Script('00'), new bsv.deps.bnjs.BN(1000))
    const bsvPreimage = new Uint8Array(bsvPreimageBuf.buffer, bsvPreimageBuf.byteOffset, bsvPreimageBuf.byteLength)
    const tx = decodeTx(decodeHex(bsvtx.toString()))
    const runPreimage = await preimage(tx, 0, [0x00], 1000, SIGHASH_SINGLE | SIGHASH_FORKID)
    expect(bsvPreimage).to.deep.equal(runPreimage)
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
    const bsvPreimageBuf = bsv.Transaction.Sighash.sighashPreimage(bsvtx,
      bsv.crypto.Signature.SIGHASH_SINGLE | bsv.crypto.Signature.SIGHASH_ANYONECANPAY |
        bsv.crypto.Signature.SIGHASH_FORKID, 0, new bsv.Script('00'), new bsv.deps.bnjs.BN(1000))
    const bsvPreimage = new Uint8Array(bsvPreimageBuf.buffer, bsvPreimageBuf.byteOffset, bsvPreimageBuf.byteLength)
    const tx = decodeTx(decodeHex(bsvtx.toString()))
    const runPreimage = await preimage(tx, 0, [0x00], 1000,
      SIGHASH_SINGLE | SIGHASH_ANYONECANPAY | SIGHASH_FORKID)
    expect(bsvPreimage).to.deep.equal(runPreimage)
  })

  it('supports no sequence, outputs, version, or locktime', async () => {
    const utxo = {
      txid: '0000000000000000000000000000000000000000000000000000000000000000',
      vout: 0,
      script: '00',
      satoshis: 1000
    }
    const bsvtx = new bsv.Transaction().from(utxo)
    const bsvPreimageBuf = bsv.Transaction.Sighash.sighashPreimage(bsvtx,
      bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID,
      0, new bsv.Script('00'), new bsv.deps.bnjs.BN(1000))
    const bsvPreimage = new Uint8Array(bsvPreimageBuf.buffer, bsvPreimageBuf.byteOffset, bsvPreimageBuf.byteLength)
    const tx = decodeTx(decodeHex(bsvtx.toString()))
    delete tx.version
    delete tx.inputs[0].sequence
    delete tx.outputs
    delete tx.locktime
    const runPreimage = await preimage(tx, 0, [0x00], 1000, SIGHASH_ALL | SIGHASH_FORKID)
    expect(bsvPreimage).to.deep.equal(runPreimage)
  })
})
