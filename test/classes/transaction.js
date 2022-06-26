const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { Transaction, PrivateKey, Script } = nimble
const { createP2PKHLockScript } = nimble.functions
const { opcodes } = nimble.constants
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
      expect(Array.from([...tx2.inputs[0].script])).to.deep.equal(Array.from([...tx.inputs[0].script]))
      expect(tx2.inputs[0].sequence).to.equal(tx.inputs[0].sequence)
      expect(Array.from(tx2.outputs[0].script)).to.deep.equal(Array.from(tx.outputs[0].script))
      expect(tx2.outputs[0].satoshis).to.equal(tx.outputs[0].satoshis)
    })

    it('throws if not a hex string', () => {
      const buffer = new Transaction().toBuffer()
      expect(() => Transaction.fromHex(buffer)).to.throw('not a string')
    })

    it('throws if bad', () => {
      const badHex = new Transaction().toString() + '00'
      expect(() => Transaction.fromHex(badHex)).to.throw('unconsumed data')
    })
  })

  describe('fromString', () => {
    it('creates from string', () => {
      const tx = new Transaction()
      const tx2 = Transaction.fromString(tx.toString())
      expect(Array.from(tx2.toBuffer())).to.deep.equal(Array.from(tx.toBuffer()))
    })

    it('throws if bad', () => {
      const badHex = '00' + new Transaction().toString()
      expect(() => Transaction.fromHex(badHex)).to.throw('unconsumed data')
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
      expect(() => Transaction.fromBuffer(hex)).to.throw('not a buffer')
    })

    it('throws if bad', () => {
      const badBuffer = [0].concat(Array.from(new Transaction().toBuffer()))
      expect(() => Transaction.fromBuffer(badBuffer)).to.throw('unconsumed data')
    })

    it('creates script objects', () => {
      const dummyTxid = new Transaction().hash
      const tx = new Transaction()
      const script = [3, 1, 2, 3, opcodes.OP_CHECKSIG, opcodes.OP_ADD]
      tx.inputs.push({ txid: dummyTxid, vout: 1, script: script, sequence: 5 })
      tx.outputs.push({ script: [], satoshis: 4 })
      const tx2 = Transaction.fromBuffer(tx.toBuffer())
      expect(tx2.inputs[0].script instanceof Script).to.equal(true)
      expect(tx2.outputs[0].script instanceof Script).to.equal(true)
    })

    it('1gb tx', function () {
      this.timeout(10000)
      const tx = { inputs: [], outputs: [] }
      for (let i = 0; i < 1024; i++) {
        tx.outputs.push({ script: new Uint8Array(1 * 1024 * 1024), satoshis: 123 })
      }
      const buffer = nimble.functions.encodeTx(tx)
      const tx2 = Transaction.fromBuffer(buffer)
      expect(tx2.outputs.length).to.equal(tx.outputs.length)
    })
  })

  describe('toString', () => {
    it('returns hex string', () => {
      const privateKey = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(privateKey.toAddress(), 1000)
      const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000)
      expect(new bsv.Transaction(tx2.toString()).toString()).to.deep.equal(tx2.toString())
      expect(new bsv.Transaction(tx2.toHex()).toString()).to.deep.equal(tx2.toHex())
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

  describe('hash', () => {
    it('returns txid', () => {
      const address = PrivateKey.fromRandom().toAddress().toString()
      const bsvtx = new bsv.Transaction().to(address, 1000)
      const nimbletx = nimble.Transaction.fromString(bsvtx.toString())
      expect(nimbletx.hash).to.equal(bsvtx.hash)
    })

    it('caches txid when finalized', () => {
      const tx = new nimble.Transaction().finalize()
      const t0 = new Date()
      tx.hash // eslint-disable-line
      const t1 = new Date()
      for (let i = 0; i < 100; i++) {
        tx.hash // eslint-disable-line
      }
      const t2 = new Date()
      expect(Math.round((t2 - t1) / 100)).to.be.lessThanOrEqual(t1 - t0)
    })

    it('computes change before calculating hash', () => {
      const privateKey = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(privateKey.toAddress(), 9000)
      const tx2 = new Transaction()
        .from(tx1.outputs[0])
        .to(privateKey.toAddress(), 1000)
        .change(privateKey.toAddress())
        .sign(privateKey)
      const hash = tx2.hash
      expect(tx2.changeOutput.satoshis).not.to.equal(0)
      expect(hash).to.equal(new bsv.Transaction(tx2.toString()).hash)
    })
  })

  describe('fee', () => {
    it('returns input satoshis minus output satoshis', () => {
      const txid = new Transaction().hash
      const utxo1 = { txid, vout: 0, script: [], satoshis: 2000 }
      const utxo2 = { txid, vout: 1, script: [], satoshis: 100 }
      const address = PrivateKey.fromRandom().toAddress()
      const tx = new Transaction()
        .from(utxo1)
        .from(utxo2)
        .to(address, 1000)
        .to(address, 500)
      expect(tx.fee).to.equal(600)
    })

    it('throws if missing previous output information', () => {
      const txid = new Transaction().hash
      const tx = new Transaction()
        .input({ txid, vout: 0, script: [], sequence: 0 })
      expect(() => tx.fee).to.throw('missing previous output information for input 0')
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
      expect(tx2.inputs[0].sequence).to.equal(0xffffffff)
      expect(tx2.inputs[0].output).to.equal(tx1.outputs[0])
    })

    it('adds utxo', () => {
      const pk = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(pk.toAddress(), 1000)
      const utxo = {
        txid: tx1.hash,
        vout: 0,
        script: tx1.outputs[0].script,
        satoshis: tx1.outputs[0].satoshis
      }
      const tx2 = new Transaction().from(utxo)
      expect(tx2.inputs[0].txid).to.equal(tx1.hash)
      expect(tx2.inputs[0].vout).to.equal(0)
      expect(tx2.inputs[0].script.length).to.equal(0)
      expect(tx2.inputs[0].sequence).to.equal(0xffffffff)
      expect(tx2.inputs[0].output.script).to.equal(utxo.script)
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

    it('throws if bad txid', () => {
      const txidBuffer = nimble.functions.decodeHex(new Transaction().hash)
      expect(() => new Transaction().from({ txid: undefined, vout: 0, script: [], satoshis: 1000 })).to.throw('bad txid')
      expect(() => new Transaction().from({ txid: txidBuffer, vout: 0, script: [], satoshis: 1000 })).to.throw('bad txid')
    })

    it('throws if bad vout', () => {
      const txid = new Transaction().hash
      expect(() => new Transaction().from({ txid, vout: -1, script: [], satoshis: 1000 })).to.throw('bad vout')
      expect(() => new Transaction().from({ txid, vout: 1.5, script: [], satoshis: 1000 })).to.throw('bad vout')
      expect(() => new Transaction().from({ txid, vout: null, script: [], satoshis: 1000 })).to.throw('bad vout')
    })

    it('throws if bad script', () => {
      const txid = new Transaction().hash
      expect(() => new Transaction().from({ txid, vout: 0, script: null, satoshis: 1000 })).to.throw('unsupported type')
      expect(() => new Transaction().from({ txid, vout: 0, script: {}, satoshis: 1000 })).to.throw('bad hex char')
    })

    it('throws if bad satoshis', () => {
      const txid = new Transaction().hash
      expect(() => new Transaction().from({ txid, vout: 0, script: [], satoshis: -1 })).to.throw('bad satoshis')
      expect(() => new Transaction().from({ txid, vout: 0, script: [], satoshis: 1.5 })).to.throw('bad satoshis')
      expect(() => new Transaction().from({ txid, vout: 0, script: [], satoshis: Number.MAX_VALUE })).to.throw('bad satoshis')
    })

    it('supports array', () => {
      const pk = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(pk.toAddress(), 1000)
      const tx2 = new Transaction().to(pk.toAddress(), 1000)
      const tx3 = new Transaction().from([tx1.outputs[0], tx2.outputs[0]])

      expect(tx3.inputs[0].txid).to.equal(tx1.hash)
      expect(tx3.inputs[0].vout).to.equal(0)
      expect(tx3.inputs[0].script.length).to.equal(0)
      expect(tx3.inputs[0].sequence).to.equal(0xffffffff)
      expect(tx3.inputs[0].output).to.equal(tx1.outputs[0])

      expect(tx3.inputs[1].txid).to.equal(tx2.hash)
      expect(tx3.inputs[1].vout).to.equal(0)
      expect(tx3.inputs[1].script.length).to.equal(0)
      expect(tx3.inputs[1].sequence).to.equal(0xffffffff)
      expect(tx3.inputs[1].output).to.equal(tx2.outputs[0])
    })
  })

  describe('to', () => {
    it('adds output', () => {
      const pk = PrivateKey.fromRandom()
      const tx = new Transaction().to(pk.toAddress(), 1000)
      expect(Array.from(tx.outputs[0].script)).to.deep.equal(Array.from(createP2PKHLockScript(pk.toAddress().pubkeyhash)))
      expect(tx.outputs[0].satoshis).to.equal(1000)
    })

    it('returns self for chaining', () => {
      const pk = PrivateKey.fromRandom()
      const tx = new Transaction()
      expect(tx.to(pk.toAddress(), 1000)).to.equal(tx)
    })

    it('throws if not a valid address', () => {
      expect(() => new Transaction().to(null, 1000)).to.throw('unsupported type')
      expect(() => new Transaction().to({}, 1000)).to.throw('bad base58 chars')
    })

    it('throws if not a valid satoshis', () => {
      const address = PrivateKey.fromRandom().toAddress()
      expect(() => new Transaction().to(address)).to.throw('bad satoshis')
      expect(() => new Transaction().to(address, -1)).to.throw('bad satoshis')
      expect(() => new Transaction().to(address, 1.5)).to.throw('bad satoshis')
      expect(() => new Transaction().to(address, Number.MAX_VALUE)).to.throw('bad satoshis')
    })
  })

  describe('input', () => {
    it('adds input object', () => {
      const pk = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(pk.toAddress(), 1000)
      const input = { txid: tx1.hash, vout: 0, script: [1], sequence: 2 }
      const tx2 = new Transaction().input(input)
      expect(tx2.inputs[0].txid).to.equal(tx1.hash)
      expect(tx2.inputs[0].vout).to.equal(0)
      expect(Array.from(tx2.inputs[0].script)).to.deep.equal([1])
      expect(tx2.inputs[0].sequence).to.equal(2)
    })

    it('adds Input instance', () => {
      const pk = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(pk.toAddress(), 1000)
      const input = new Transaction.Input(tx1.hash, 0)
      const tx2 = new Transaction().input(input)
      expect(tx2.inputs[0].txid).to.equal(tx1.hash)
    })

    it('returns self for chaining', () => {
      const pk = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(pk.toAddress(), 1000)
      const input = { txid: tx1.hash, vout: 0, script: [1], sequence: 2 }
      const tx2 = new Transaction()
      expect(tx2.input(input)).to.equal(tx2)
    })

    it('throws if not a valid input', () => {
      expect(() => new Transaction().input()).to.throw('bad input')
      expect(() => new Transaction().input(null)).to.throw('bad input')
    })

    it('throws if bad txid', () => {
      expect(() => new Transaction().input({ txid: undefined, vout: 0, script: [], sequence: 0 })).to.throw('bad txid')
      expect(() => new Transaction().input({ txid: [], vout: 0, script: [], sequence: 0 })).to.throw('bad txid')
      expect(() => new Transaction().input({ txid: 'abc', vout: 0, script: [], sequence: 0 })).to.throw('bad txid')
    })

    it('throws if bad vout', () => {
      const txid = new Transaction().hash
      expect(() => new Transaction().input({ txid, vout: 1.5, script: [], sequence: 0 })).to.throw('bad vout')
      expect(() => new Transaction().input({ txid, vout: -1, script: [], sequence: 0 })).to.throw('bad vout')
    })

    it('throws if bad script', () => {
      const txid = new Transaction().hash
      expect(() => new Transaction().input({ txid, vout: 0, script: 'xy', sequence: 0 })).to.throw('bad hex char')
      expect(() => new Transaction().input({ txid, vout: 0, script: null, sequence: 0 })).to.throw('unsupported type')
    })

    it('throws if bad sequence', () => {
      const txid = new Transaction().hash
      expect(() => new Transaction().input({ txid, vout: 0, script: [], sequence: -1 })).to.throw('bad sequence')
      expect(() => new Transaction().input({ txid, vout: 0, script: [], sequence: '0' })).to.throw('bad sequence')
      expect(() => new Transaction().input({ txid, vout: 0, script: [], sequence: 0xffffffff + 1 })).to.throw('bad sequence')
    })

    it('supports output property', () => {
      const txid = new Transaction().hash
      const output = { script: [2], satoshis: 2 }
      const tx = new Transaction().input({ txid, vout: 0, script: [], sequence: 0, output })
      expect(Array.from(tx.inputs[0].output.script)).to.deep.equal([2])
      expect(tx.inputs[0].output.satoshis).to.equal(2)
    })

    it('uses txid and vout from output property if unspecified', () => {
      const txid = new Transaction().hash
      const output = { txid, vout: 0, script: [2], satoshis: 2 }
      const tx = new Transaction().input({ script: [], sequence: 0, output })
      expect(Array.from(tx.inputs[0].output.script)).to.deep.equal([2])
      expect(tx.inputs[0].output.satoshis).to.equal(2)
    })

    it('throws if bad output property', () => {
      const txid = new Transaction().hash
      const output1 = { script: 'xyz', satoshis: 0 }
      const output2 = { script: [], satoshis: -1 }
      expect(() => new Transaction().input({ txid, vout: 0, script: [], sequence: 0, output: output1 })).to.throw('bad hex char')
      expect(() => new Transaction().input({ txid, vout: 0, script: [], sequence: 0, output: output2 })).to.throw('bad satoshis')
    })
  })

  describe('output', () => {
    it('adds output object', () => {
      const pk = PrivateKey.fromRandom()
      const script = createP2PKHLockScript(pk.toAddress().pubkeyhash)
      const output = { script, satoshis: 1000 }
      const tx = new Transaction().output(output)
      expect(Array.from(tx.outputs[0].script)).to.deep.equal(Array.from(script))
      expect(tx.outputs[0].satoshis).to.equal(1000)
    })

    it('adds Output instance', () => {
      const pk = PrivateKey.fromRandom()
      const script = createP2PKHLockScript(pk.toAddress().pubkeyhash)
      const output = new Transaction.Output(script, 1000)
      const tx = new Transaction().output(output)
      expect(Array.from(tx.outputs[0].script)).to.deep.equal(Array.from(script))
    })

    it('returns self for chaining', () => {
      const tx = new Transaction()
      const pk = PrivateKey.fromRandom()
      const script = createP2PKHLockScript(pk.toAddress().pubkeyhash)
      const output = { script, satoshis: 1000 }
      expect(tx.output(output)).to.equal(tx)
    })

    it('throws if not a valid output', () => {
      expect(() => new Transaction().output({ script: null, satoshis: 0 })).to.throw('unsupported type')
      expect(() => new Transaction().output({ script: [], satoshis: null })).to.throw('bad satoshis')
    })
  })

  describe('change', () => {
    it('creates change output', () => {
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

    it('delete change output', () => {
      const utxo = { txid: new Transaction().hash, vout: 0, script: [], satoshis: 1000 }
      const address = PrivateKey.fromRandom().toAddress()
      const tx = new Transaction().from(utxo).change(address)
      tx.outputs = []
      tx.finalize()
      expect(tx.outputs.length).to.equal(0)
    })

    it('throws if already has change output', () => {
      const utxo = { txid: new Transaction().hash, vout: 0, script: [], satoshis: 1000 }
      const address = PrivateKey.fromRandom().toAddress()
      const tx = new Transaction().from(utxo).change(address)
      expect(() => tx.change(address)).to.throw('change output already added')
    })
  })

  describe('sign', () => {
    it('signs matching p2pkh scripts', () => {
      const privateKey = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(privateKey.toAddress(), 1000)
      const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000).sign(privateKey)
      expect(tx2.inputs[0].script.length > 0).to.equal(true)
      nimble.functions.verifyScript(tx2.inputs[0].script, tx1.outputs[0].script, tx2, 0, tx1.outputs[0].satoshis)
    })

    it('supports string private key', () => {
      const privateKey = PrivateKey.fromRandom()
      new Transaction().sign(privateKey.toString()) // eslint-disable-line
    })

    it('does not sign different addresses', () => {
      const privateKey1 = PrivateKey.fromRandom()
      const privateKey2 = PrivateKey.fromRandom()
      const tx0 = new Transaction().to(privateKey1.toAddress(), 1000)
      const tx1 = new Transaction().to(privateKey2.toAddress(), 1000)
      const tx2 = new Transaction().from(tx0.outputs[0]).from(tx1.outputs[0]).to(privateKey2.toAddress(), 2000).sign(privateKey2)
      expect(tx2.inputs[0].script.length === 0).to.equal(true)
      expect(tx2.inputs[1].script.length > 0).to.equal(true)
    })

    it('does not sign non-p2pkh', () => {
      const privateKey = PrivateKey.fromRandom()
      const script = Array.from([...nimble.functions.createP2PKHLockScript(privateKey.toAddress().pubkeyhash), 1])
      const utxo = { txid: new Transaction().hash, vout: 0, script, satoshis: 1000 }
      const tx = new Transaction().from(utxo).sign(privateKey)
      expect(tx.inputs[0].script.length).to.equal(0)
    })

    it('does not sign without previous outputs', () => {
      const privateKey = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(privateKey.toAddress(), 1000)
      const input = { txid: tx1.hash, vout: 0, script: [], sequence: 0 }
      const tx2 = new Transaction().input(input).to(privateKey.toAddress(), 2000).sign(privateKey)
      expect(tx2.inputs[0].script.length).to.equal(0)
    })

    it('does not sign if already have sign data', () => {
      const privateKey = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(privateKey.toAddress(), 1000)
      const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 2000)
      tx2.inputs[0].script = [0x01]
      tx2.sign(privateKey)
      expect(tx2.inputs[0].script).to.deep.equal([0x01])
    })

    it('returns self for chaining', () => {
      const tx = new Transaction()
      expect(tx.sign(PrivateKey.fromRandom())).to.equal(tx)
    })

    it('throws if private key not provided', () => {
      expect(() => new Transaction().sign()).to.throw('not a private key: ')
      expect(() => new Transaction().sign({})).to.throw('not a private key: [object Object]')
      expect(() => new Transaction().sign(123)).to.throw('not a private key: 123')
      expect(() => new Transaction().sign('abc')).to.throw('bad checksum')
    })
  })

  describe('verify', () => {
    it('does not throw if valid', () => {
      const privateKey = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(privateKey.toAddress(), 2000)
      const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 1000).sign(privateKey)
      expect(() => tx2.verify()).not.to.throw()
    })

    it('throws if invalid', () => {
      expect(() => new Transaction().verify()).to.throw('no inputs')
    })

    it('returns self for chaining', () => {
      const privateKey = PrivateKey.fromRandom()
      const tx1 = new Transaction().to(privateKey.toAddress(), 2000)
      const tx2 = new Transaction().from(tx1.outputs[0]).to(privateKey.toAddress(), 1000).sign(privateKey)
      expect(tx2.verify()).to.equal(tx2)
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

      const err = 'transaction finalized'
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

    it('call twice ok', () => {
      new Transaction().finalize().finalize() // eslint-disable-line
    })

    it('removes change output if not enough to cover dust', () => {
      const address = PrivateKey.fromRandom().toAddress()
      const utxo = { txid: new Transaction().hash, vout: 0, script: [], satoshis: 1 }
      const tx = new Transaction().from(utxo).change(address).finalize()
      expect(tx.outputs.length).to.equal(0)
      expect(tx.changeOutput).to.equal(undefined)
    })
  })

  describe('feePerKb', () => {
    it('change the feePerKb', () => {
      const tx = new Transaction().setFeePerKb(0)
      const tx2 = new Transaction()
      const bsvTx = new bsv.Transaction()
      bsvTx.feePerKb = 0

      expect(tx.feePerKb).to.equal(bsvTx.feePerKb)
      expect(tx.feePerKb).to.not.equal(tx2.feePerKb)
      expect(tx.feePerKb).to.equal(0)
      expect(tx2.feePerKb).to.equal(nimble.feePerKb)
    })

    it('throws if invalid', () => {
      expect(() => new Transaction().setFeePerKb(-1)).to.throw('bad satoshis: -1')
      expect(() => new Transaction().finalize().setFeePerKb(-1)).to.throw('transaction finalized')
    })
  })
})
