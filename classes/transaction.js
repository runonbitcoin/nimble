const generateTxSignature = require('../functions/generate-tx-signature')
const createP2PKHLockScript = require('../functions/create-p2pkh-lock-script')
const encodeHex = require('../functions/encode-hex')
const decodeHex = require('../functions/decode-hex')
const extractP2PKHLockScriptPubkeyhash = require('../functions/extract-p2pkh-lock-script-pubkeyhash')
const isHex = require('../functions/is-hex')
const isP2PKHLockScript = require('../functions/is-p2pkh-lock-script')
const writePushData = require('../functions/write-push-data')
const areBuffersEqual = require('../functions/are-buffers-equal')
const decodeTx = require('../functions/decode-tx')
const encodeTx = require('../functions/encode-tx')
const calculateTxid = require('../functions/calculate-txid')
const PrivateKey = require('./private-key')
const Address = require('./address')
const Script = require('./script')
const BufferWriter = require('./buffer-writer')
const isBuffer = require('../functions/is-buffer')
const verifyTx = require('../functions/verify-tx')

// These WeakMap caches allow the objects themselves to maintain their immutability
const TRANSACTION_TO_TXID_CACHE = new WeakMap()

class Transaction {
  constructor(...args) {
    if (args.length)
      throw new Error('use Transaction.fromHex() to parse a transaction')

    // This basic data structure matches what the functions encodeTx and decodeTx expect
    this.version = 1
    this.inputs = []
    this.outputs = []
    this.locktime = 0
    this.feePerKb = require('../index').feePerKb

    // An actual output object matching an entry in this.outputs
    this.changeOutput = undefined
  }

  static fromHex(hex) {
    const buffer = decodeHex(hex)
    return Transaction.fromBuffer(buffer)
  }

  static fromString(hex) {
    return this.fromHex(hex)
  }

  static fromBuffer(buffer) {
    if (!isBuffer(buffer)) throw new Error('not a buffer')
    const txData = decodeTx(buffer)

    const tx = new this()
    txData.inputs.forEach((inp) => tx.input(inp))
    txData.outputs.forEach((out) => tx.output(out))
    tx.locktime = txData.locktime
    tx.version = txData.version

    return tx
  }

  toHex() {
    return encodeHex(this.toBuffer())
  }

  toString() {
    return this.toHex()
  }

  toBuffer() {
    this._calculateChange()
    return encodeTx(this)
  }

  get hash() {
    if (Object.isFrozen(this)) {
      if (TRANSACTION_TO_TXID_CACHE.has(this))
        return TRANSACTION_TO_TXID_CACHE.get(this)
      const txid = calculateTxid(this.toBuffer())
      TRANSACTION_TO_TXID_CACHE.set(this, txid)
      return txid
    }

    return calculateTxid(this.toBuffer())
  }

  get fee() {
    const incompleteInputIndex = this.inputs.findIndex((x) => !x.output)
    if (incompleteInputIndex !== -1) {
      const hint = `Hint: Set tx.inputs[${incompleteInputIndex}].output = new Transaction.Output(script, satoshis)`
      throw new Error(
        `missing previous output information for input ${incompleteInputIndex}\n\n${hint}`
      )
    }

    const satoshisIn = this.inputs.reduce(
      (prev, curr) => prev + curr.output.satoshis,
      0
    )
    const satoshisOut = this.outputs.reduce(
      (prev, curr) => prev + curr.satoshis,
      0
    )

    return satoshisIn - satoshisOut
  }

  from(output) {
    if (Object.isFrozen(this)) throw new Error('transaction finalized')

    if (Array.isArray(output)) {
      output.forEach((output) => this.from(output))
      return this
    }

    const input = new Input(output.txid, output.vout, [], 0xffffffff, output)
    this.inputs.push(input)

    return this
  }

  to(address, satoshis) {
    if (Object.isFrozen(this)) throw new Error('transaction finalized')

    address = Address.from(address)
    verifySatoshis(satoshis)

    const script = createP2PKHLockScript(address.pubkeyhash)
    const output = new Output(script, satoshis, this)
    this.outputs.push(output)

    return this
  }

  input(input) {
    if (Object.isFrozen(this)) throw new Error('transaction finalized')
    if (typeof input !== 'object' || !input) throw new Error('bad input')

    input =
      input instanceof Input
        ? input
        : new Input(
            typeof input.txid === 'undefined' && input.output
              ? input.output.txid
              : input.txid,
            typeof input.vout === 'undefined' && input.output
              ? input.output.vout
              : input.vout,
            input.script,
            input.sequence,
            input.output
          )

    this.inputs.push(input)

    return this
  }

  output(output) {
    if (Object.isFrozen(this)) throw new Error('transaction finalized')

    output =
      output instanceof Output
        ? output
        : new Output(output.script, output.satoshis, this)
    output.tx = this

    this.outputs.push(output)

    return this
  }

  change(address) {
    if (Object.isFrozen(this)) throw new Error('transaction finalized')

    if (this.changeOutput) throw new Error('change output already added')

    const script = createP2PKHLockScript(Address.from(address).pubkeyhash)
    const output = new Output(script, 0, this)

    this.outputs.push(output)
    this.changeOutput = output

    return this
  }

  sign(privateKey) {
    if (Object.isFrozen(this)) throw new Error('transaction finalized')

    if (typeof privateKey === 'string') {
      privateKey = PrivateKey.fromString(privateKey)
    }

    if (!(privateKey instanceof PrivateKey))
      throw new Error(`not a private key: ${privateKey}`)

    for (let vin = 0; vin < this.inputs.length; vin++) {
      const input = this.inputs[vin]
      const output = input.output

      if (input.script.length) continue
      if (!output) continue

      const outputScript = output.script
      const outputSatoshis = output.satoshis

      if (!isP2PKHLockScript(output.script)) continue
      if (
        !areBuffersEqual(
          extractP2PKHLockScriptPubkeyhash(output.script),
          privateKey.toAddress().pubkeyhash
        )
      )
        continue

      const txsignature = generateTxSignature(
        this,
        vin,
        outputScript,
        outputSatoshis,
        privateKey.number,
        privateKey.toPublicKey().point
      )

      const writer = new BufferWriter()
      writePushData(writer, txsignature)
      writePushData(writer, privateKey.toPublicKey().toBuffer())
      const script = writer.toBuffer()

      input.script = Script.fromBuffer(script)
    }

    return this
  }

  verify() {
    const parents = this.inputs.map((input) => input.output)
    const minFeePerKb = this.feePerKb
    verifyTx(this, parents, minFeePerKb)
    return this
  }

  // Calculates change and then locks a transaction so that no further changes may be made
  finalize() {
    if (Object.isFrozen(this)) return this

    this._calculateChange()

    Object.freeze(this)
    Object.freeze(this.inputs)
    Object.freeze(this.outputs)
    this.inputs.forEach((input) => Object.freeze(input))
    this.outputs.forEach((output) => Object.freeze(output))

    return this
  }

  _calculateChange() {
    if (Object.isFrozen(this)) return

    const changeIndex = this.outputs.indexOf(this.changeOutput)
    if (changeIndex === -1) {
      this.changeOutput = undefined
      return
    }

    this.changeOutput.satoshis = 0

    const currentFee = this.fee
    const expectedFee = Math.ceil(
      (encodeTx(this).length * this.feePerKb) / 1000
    )

    const change = currentFee - expectedFee
    const minDust = 1

    if (change >= minDust) {
      this.changeOutput.satoshis = change
    } else {
      this.outputs.splice(changeIndex, 1)
      this.changeOutput = undefined
    }
  }

  setFeePerKb(satoshis) {
    if (Object.isFrozen(this)) throw new Error('transaction finalized')
    verifySatoshis(satoshis)
    this.feePerKb = satoshis
    return this
  }
}

class Input {
  constructor(txid, vout, script = [], sequence = 0, output = undefined) {
    if (!isHex(txid) || txid.length !== 64) throw new Error(`bad txid: ${txid}`)
    if (!Number.isInteger(vout) || vout < 0)
      throw new Error(`bad vout: ${vout}`)

    this.txid = txid
    this.vout = vout
    this.script = Script.from(script)
    this.sequence = verifySequence(sequence)

    if (output instanceof Output) {
      this.output = output
    } else if (typeof output === 'object' && output) {
      this.output = new Output(output.script, output.satoshis)
    }
  }
}

class Output {
  constructor(script, satoshis, tx = undefined) {
    this.script = Script.from(script)
    this.satoshis = verifySatoshis(satoshis)
    this.tx = tx
  }

  get txid() {
    return this.tx.hash
  }
  get vout() {
    return this.tx.outputs.indexOf(this)
  }
}

function verifySatoshis(satoshis) {
  if (
    !Number.isInteger(satoshis) ||
    satoshis < 0 ||
    satoshis > Number.MAX_SAFE_INTEGER
  ) {
    throw new Error(`bad satoshis: ${satoshis}`)
  }
  return satoshis
}

function verifySequence(sequence) {
  if (!Number.isInteger(sequence) || sequence < 0 || sequence > 0xffffffff) {
    throw new Error(`bad sequence: ${sequence}`)
  }
  return sequence
}

Transaction.Input = Input
Transaction.Output = Output

module.exports = Transaction
