const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { Transaction, PrivateKey } = nimble
const { createP2PKHLockScript } = nimble.functions
const bsv = require('bsv')

describe('Transaction', () => {
  describe('constructor', () => {
    it('creates empty transaction', () => {
      const tx = new Transaction()
      expect(tx.version).to.equal(new bsv.Transaction().version)
      expect(tx.inputs.length).to.equal(0)
      expect(tx.outputs.length).to.equal(0)
      expect(tx.locktime).to.equal(new bsv.Transaction().nLockTime)
    })

    it('throws if any arguments are passed', () => {
      const hex = new Transaction().toString()
      expect(() => new Transaction(hex)).to.throw()
    })
  })

  describe('fromHex', () => {
    it('parses hex string', () => {
      const dummyTxid = new Transaction().hash
      const tx = new Transaction()
      tx.version = 2
      tx.locktime = 3
      tx.inputs.push({ txid: dummyTxid, vout: 1, script: [], sequence: 5 })
      tx.outputs.push({ script: [0], satoshis: 4 })
      const hex = tx.toString()
      const tx2 = Transaction.fromHex(hex)
      expect(tx2.version).to.equal(tx.version)
      expect(tx2.locktime).to.equal(tx.locktime)
      expect(tx2.inputs.length).to.equal(tx.inputs.length)
      expect(tx2.outputs.length).to.equal(tx.outputs.length)
      expect(tx2.inputs[0].txid).to.equal(tx.inputs[0].txid)
      expect(tx2.inputs[0].vout).to.equal(tx.inputs[0].vout)
      expect(Array.from(tx2.inputs[0].script)).to.deep.equal(Array.from(tx.inputs[0].script))
      expect(tx2.inputs[0].sequence).to.equal(tx.inputs[0].sequence)
      expect(Array.from(tx2.outputs[0].script)).to.deep.equal(Array.from(tx.outputs[0].script))
      expect(tx2.outputs[0].satoshis).to.equal(tx.outputs[0].satoshis)
    })

    it('throws if not a hex string', () => {
      const buffer = new Transaction().toBuffer()
      expect(() => Transaction.fromHex(buffer)).to.throw()
    })

    it('throws if invalid', () => {
      const badHex = new Transaction().toString() + '00'
      expect(() => Transaction.fromHex(badHex)).to.throw()
    })
  })

  describe('fromBuffer', () => {
    it('parses buffer', () => {
      const dummyTxid = new Transaction().hash
      const tx = new Transaction()
      tx.version = 2
      tx.locktime = 3
      tx.inputs.push({ txid: dummyTxid, vout: 1, script: [], sequence: 5 })
      tx.outputs.push({ script: [0], satoshis: 4 })
      const buffer = tx.toBuffer()
      const tx2 = Transaction.fromBuffer(buffer)
      expect(tx2.version).to.equal(tx.version)
      expect(tx2.locktime).to.equal(tx.locktime)
      expect(tx2.inputs.length).to.equal(tx.inputs.length)
      expect(tx2.outputs.length).to.equal(tx.outputs.length)
      expect(tx2.inputs[0].txid).to.equal(tx.inputs[0].txid)
      expect(tx2.inputs[0].vout).to.equal(tx.inputs[0].vout)
      expect(Array.from(tx2.inputs[0].script)).to.deep.equal(Array.from(tx.inputs[0].script))
      expect(tx2.inputs[0].sequence).to.equal(tx.inputs[0].sequence)
      expect(Array.from(tx2.outputs[0].script)).to.deep.equal(Array.from(tx.outputs[0].script))
      expect(tx2.outputs[0].satoshis).to.equal(tx.outputs[0].satoshis)
    })

    it('throws if not a buffer', () => {
      const hex = new Transaction().toString()
      expect(() => Transaction.fromBuffer(hex)).to.throw()
    })

    it('throws if invalid', () => {
      const badBuffer = [0].concat(new Transaction().toBuffer())
      expect(() => Transaction.fromBuffer(badBuffer)).to.throw()
    })
  })

  describe('hash', () => {
    it('returns txid', () => {
      const bsvtx = new bsv.Transaction()
      const nimbletx = nimble.Transaction.fromString(bsvtx.toString())
      expect(nimbletx.hash).to.equal(bsvtx.hash)
    })

    it('caches txid when finalized', () => {
      const tx = new nimble.Transaction().finalize()
      const t0 = new Date()
      tx.hash // eslint-disable-line
      const t1 = new Date()
      tx.hash // eslint-disable-line
      const t2 = new Date()
      expect(t2 - t1).to.be.lessThanOrEqual(t1 - t0)
    })
  })

  describe('from', () => {
    it('adds transaction output', () => {
      const pk = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(pk.toAddress(), 1000)
      const tx2 = new Transaction().from(tx1.outputs[0])
      expect(tx2.inputs[0].txid).to.equal(tx1.hash)
      expect(tx2.inputs[0].vout).to.equal(0)
      expect(tx2.inputs[0].script.length).to.equal(0)
      expect(tx2.inputs[0].sequence).to.equal(0)
      expect(tx2.inputs[0].output).to.equal(tx1.outputs[0])
    })

    it('adds utxo', () => {
      const pk = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(pk.toAddress(), 1000)
      const utxo = {
        txid: tx1.hash,
        vout: 0,
        script: tx1.outputs[0].scriptHex,
        satoshis: tx1.outputs[0].satoshis
      }
      const tx2 = new Transaction().from(utxo)
      expect(tx2.inputs[0].txid).to.equal(tx1.hash)
      expect(tx2.inputs[0].vout).to.equal(0)
      expect(tx2.inputs[0].script.length).to.equal(0)
      expect(tx2.inputs[0].sequence).to.equal(0)
      expect(tx2.inputs[0].output.scriptHex).to.equal(utxo.script)
      expect(tx2.inputs[0].output.satoshis).to.equal(utxo.satoshis)
    })

    it('returns self for chaining', () => {
      const pk = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(pk.toAddress(), 1000)
      const tx2 = new Transaction()
      expect(tx2.from(tx1.outputs[0])).to.equal(tx2)
    })

    it('throws if not an output or utxo', () => {
      expect(() => new Transaction().from()).to.throw()
      expect(() => new Transaction().from(null)).to.throw()
      expect(() => new Transaction().from({})).to.throw()
    })
  })

  describe('to', () => {
    it('adds output', () => {
      const pk = PrivateKey.fromRandom()
      const tx = new Transaction().to(pk.toAddress(), 1000)
      expect(Array.from(tx.outputs[0].script)).to.deep.equal(Array.from(createP2PKHLockScript(pk.toAddress().toString())))
      expect(tx.outputs[0].satoshis).to.equal(1000)
    })

    it('returns self for chaining', () => {
      const pk = PrivateKey.fromRandom()
      const tx = new Transaction()
      expect(tx.to(pk.toAddress(), 1000)).to.equal(tx)
    })

    it.skip('throws if not a valid address', () => {

    })

    it.skip('throws if not a valid satoshis', () => {

    })
  })

  describe('input', () => {
    it('adds input', () => {
      const pk = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(pk.toAddress(), 1000)
      const input = { txid: tx1.hash, vout: 0, script: [1], sequence: 2 }
      const tx2 = new Transaction().input(input)
      expect(tx2.inputs[0].txid).to.equal(tx1.hash)
      expect(tx2.inputs[0].vout).to.equal(0)
      expect(Array.from(tx2.inputs[0].script)).to.deep.equal([1])
      expect(tx2.inputs[0].sequence).to.equal(2)
    })

    it('returns self for chaining', () => {
      const pk = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(pk.toAddress(), 1000)
      const input = { txid: tx1.hash, vout: 0, script: [1], sequence: 2 }
      const tx2 = new Transaction()
      expect(tx2.input(input)).to.equal(tx2)
    })

    it.skip('throws if not a valid input', () => {
      // TODO
    })
  })

  describe('output', () => {
    it('adds output', () => {
      const pk = PrivateKey.fromRandom()
      const script = createP2PKHLockScript(pk.toAddress().toString())
      const output = { script, satoshis: 1000 }
      const tx = new Transaction().output(output)
      expect(Array.from(tx.outputs[0].script)).to.deep.equal(Array.from(script))
      expect(tx.outputs[0].satoshis).to.equal(1000)
    })

    it('returns self for chaining', () => {
      const tx = new Transaction()
      const pk = PrivateKey.fromRandom()
      const script = createP2PKHLockScript(pk.toAddress().toString())
      const output = { script, satoshis: 1000 }
      expect(tx.output(output)).to.equal(tx)
    })

    it.skip('throws if not a valid output', () => {
      // TODO
    })
  })

  describe('change', () => {
    it.skip('creates change output', () => {
      const privateKey = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(privateKey.toAddress(), 9000)
      const tx2 = new Transaction()
        .from(tx1.outputs[0])
        .to(privateKey.toAddress(), 1000)
        .change(privateKey.toAddress())
        .sign(privateKey)
        .finalize()
      expect(Math.ceil(tx2.toBuffer().length * nimble.feePerKb / 1000)).to.equal(tx2.fee)
    })

    it('returns self for chaining', () => {
      const tx = new Transaction()
      expect(tx.change(PrivateKey.fromRandom().toAddress())).to.equal(tx)
    })

    it.skip('throws if already has change output', () => {
      // TODO
    })

    it.skip('does not add change output if not enough change', () => {
      // TODO
    })
  })

  describe('sign', () => {
    it('signs matching p2pkh scripts', () => {
      const privateKey = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(privateKey.toAddress(), 1000)
      const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000).sign(privateKey)
      expect(tx2.inputs[0].script.length > 0).to.equal(true)
    })

    it('supports string private key', () => {
      const privateKey = PrivateKey.fromRandom()
      new Transaction().sign(privateKey.toString()) // eslint-disable-line
    })

    it.skip('does not sign different addresses', () => {
      // TODO
    })

    it.skip('does not sign without previous outputs', () => {
      // TODO
    })

    it('returns self for chaining', () => {
      const tx = new Transaction()
      expect(tx.sign(PrivateKey.fromRandom())).to.equal(tx)
    })

    it('throws if private key not provided', () => {
      expect(() => new Transaction().sign()).to.throw('Not a private key: ')
      expect(() => new Transaction().sign({})).to.throw('Not a private key: [object Object]')
      expect(() => new Transaction().sign(123)).to.throw('Not a private key: 123')
      expect(() => new Transaction().sign('abc')).to.throw('Cannot create PrivateKey: bad checksum')
    })
  })

  describe('finalize', () => {
    it('locks transaction', () => {
      const privateKey = PrivateKey.fromRandom()
      const address = privateKey.toAddress()
      const txid = new Transaction().hash

      const prev = new Transaction().to(address, 1000)

      const tx = new Transaction()
        .from(prev.outputs[0])
        .to(address, 1000)
        .finalize()

      const err = 'Transaction finalized'
      expect(() => tx.from({ txid, vout: 0, script: [], satoshis: 0 })).to.throw(err)
      expect(() => tx.to(address, 1000)).to.throw(err)
      expect(() => tx.input({ txid, vout: 0, script: [], sequence: 0 })).to.throw(err)
      expect(() => tx.output({ script: [], satoshis: 0 })).to.throw(err)
      expect(() => tx.change(address)).to.throw(err)
      expect(() => tx.sign(privateKey)).to.throw(err)

      tx.n = 1
      expect('n' in tx).to.equal(false)
      expect(() => tx.inputs.push({})).to.throw()
      expect(() => tx.outputs.push({})).to.throw()
      tx.inputs[0].vout = 1
      expect(tx.inputs[0].vout).to.equal(0)
      tx.outputs[0].satoshis = 1
      expect(tx.outputs[0].satoshis).to.equal(1000)
    })

    it('returns self for chaining', () => {
      const tx = new Transaction()
      expect(tx.finalize()).to.equal(tx)
    })

    it.skip('caches txid', () => {

    })

    it.skip('throws if called twice', () => {

    })
  })

  describe('toString', () => {
    it('returns hex string', () => {
      const privateKey = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(privateKey.toAddress(), 1000)
      const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000)
      expect(new bsv.Transaction(tx2.toString()).toString()).to.deep.equal(tx2.toString())
    })
  })

  describe('toBuffer', () => {
    it('returns buffer', () => {
      const privateKey = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(privateKey.toAddress(), 1000)
      const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000)
      expect(Array.from(new bsv.Transaction(tx2.toString()).toBuffer())).to.deep.equal(Array.from(tx2.toBuffer()))
    })
  })
})
