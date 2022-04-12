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
const BufferWriter = require('./buffer-writer')

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

// These WeakMap caches allow the objects themselves to maintain their immutability

const TRANSACTION_TO_TXID_CACHE = new WeakMap()

// ------------------------------------------------------------------------------------------------
// Transaction
// ------------------------------------------------------------------------------------------------

class Transaction {
  constructor (...args) {
    if (args.length) throw new Error('Use Transaction.fromHex() to parse a transaction')

    // This basic data structure matches what the functions encodeTx and decodeTx expect
    this.version = 1
    this.inputs = []
    this.outputs = []
    this.locktime = 0

    // An actual output object matching an entry in this.outputs
    this.changeOutput = undefined
  }

  static fromHex (hex) {
    return Transaction.fromBuffer(decodeHex(hex))
  }

  static fromBuffer (buffer) {
    const transaction = decodeTx(buffer)

    Object.setPrototypeOf(transaction, Transaction.prototype)
    transaction.inputs.forEach(input => Object.setPrototypeOf(input, Input.prototype))
    transaction.outputs.forEach(output => Object.setPrototypeOf(output, Output.prototype))
    transaction.outputs.forEach(output => { output.tx = this })

    return transaction
  }

  get hash () {
    if (Object.isFrozen(this)) {
      if (TRANSACTION_TO_TXID_CACHE.has(this)) return TRANSACTION_TO_TXID_CACHE.get(this)
      const txid = calculateTxid(this)
      TRANSACTION_TO_TXID_CACHE.set(this, txid)
      return txid
    }

    return calculateTxid(this)
  }

  get fee () {
    const incompleteInputIndex = this.inputs.findIndex(x => !x.output)
    if (incompleteInputIndex !== -1) {
      const hint = `Hint: Set tx.inputs[${incompleteInputIndex}].output = new Transaction.Output(script, satoshis)`
      throw new Error(`Missing previous output information for input ${incompleteInputIndex}\n\n${hint}`)
    }

    const satoshisIn = this.inputs.reduce((prev, curr) => prev + curr.output.satoshis, 0)
    const satoshisOut = this.outputs.reduce((prev, curr) => prev + curr.satoshis, 0)

    return satoshisIn - satoshisOut
  }

  from (output) {
    if (Object.isFrozen(this)) throw new Error('Transaction finalized')

    const input = new Input(output.txid, output.vout, [], 0, output)
    this.inputs.push(input)
    return this
  }

  to (address, satoshis) {
    if (Object.isFrozen(this)) throw new Error('Transaction finalized')

    const script = createP2PKHLockScript(address.toString())
    const output = new Output(script, satoshis, this)
    this.outputs.push(output)
    return this
  }

  input (input) {
    if (Object.isFrozen(this)) throw new Error('Transaction finalized')

    input = input instanceof Input ? input : new Input(input.txid, input.vout, input.script, input.sequence, input.output)
    this.inputs.push(input)
    return this
  }

  output (output) {
    if (Object.isFrozen(this)) throw new Error('Transaction finalized')

    output = output instanceof Output ? output : new Output(output.script, output.satoshis, this)
    output.tx = this
    this.outputs.push(output)
    return this
  }

  change (address) {
    if (Object.isFrozen(this)) throw new Error('Transaction finalized')

    if (this.changeOutput) throw new Error('Change output already added')

    const script = createP2PKHLockScript(address.toString())

    const output = new Output(script, 0, this)

    this.outputs.push(output)

    this.changeOutput = output

    return this
  }

  sign (privateKey) {
    if (Object.isFrozen(this)) throw new Error('Transaction finalized')

    if (typeof privateKey === 'string') { privateKey = PrivateKey.fromString(privateKey) }

    if (!(privateKey instanceof PrivateKey)) throw new Error(`Not a private key: ${privateKey}`)

    for (let vin = 0; vin < this.inputs.length; vin++) {
      const input = this.inputs[vin]
      const output = input.output

      if (input.script.length) continue
      if (!output) continue

      const outputScript = output.script
      const outputSatoshis = output.satoshis

      if (!isP2PKHLockScript(output.script)) continue
      if (!areBuffersEqual(extractP2PKHLockScriptPubkeyhash(output.script), privateKey.toAddress().pubkeyhash)) continue

      const txsignature = generateTxSignature(this, vin, outputScript, outputSatoshis,
        privateKey.number, privateKey.toPublicKey().point)

      const writer = new BufferWriter()
      writePushData(writer, txsignature)
      writePushData(writer, privateKey.toPublicKey().toBuffer())
      const script = writer.toBuffer()

      input.script = script
    }

    return this
  }

  finalize () {
    if (Object.isFrozen(this)) throw new Error('Transaction finalized')

    this._calculateChange()

    Object.freeze(this)
    Object.freeze(this.inputs)
    Object.freeze(this.outputs)
    this.inputs.forEach(input => Object.freeze(input))
    this.outputs.forEach(output => Object.freeze(output))

    return this
  }

  toString () {
    return encodeHex(this.toBuffer())
  }

  toBuffer () {
    this._calculateChange()

    return encodeTx(this)
  }

  _calculateChange () {
    if (Object.isFrozen(this)) return

    if (!this.changeOutput) return

    if (this.outputs.indexOf(this.changeOutput) === -1) {
      this.changeOutput = undefined
      return
    }

    this.changeOutput.satoshis = 0

    const currentFee = this.fee
    const expectedFee = Math.ceil(this.toBuffer().length / 1000 * require('../index').feePerKb)
    const change = currentFee - expectedFee

    if (change < 0) throw new Error('Not enough satoshis')

    this.changeOutput.satoshis = change
  }
}

// ------------------------------------------------------------------------------------------------
// Input
// ------------------------------------------------------------------------------------------------

class Input {
  constructor (txid, vout, script, sequence, output = undefined) {
    if (!isHex(txid) || txid.length !== 64) throw new Error(`Invalid txid: ${txid}`)
    if (!Number.isInteger(vout) || vout < 0) throw new Error(`Invalid vout: ${vout}`)

    this.txid = txid
    this.vout = vout
    this.script = typeof script === 'string' ? decodeHex(script) : script || []
    this.sequence = sequence || 0

    if (output instanceof Output) {
      this.output = output
    } else if (typeof output === 'object') {
      this.output = new Output(output.script, output.satoshis)
    }
  }
}

// ------------------------------------------------------------------------------------------------
// Output
// ------------------------------------------------------------------------------------------------

class Output {
  constructor (script, satoshis, tx = undefined) {
    this.script = typeof script === 'string' ? decodeHex(script) : script
    this.satoshis = satoshis

    this.tx = tx
  }

  get txid () { return this.tx.hash }
  get vout () { return this.tx.outputs.indexOf(this) }

  get scriptHex () {
    return encodeHex(this.script)
  }

  toAddress () {
    if (!isP2PKHLockScript(this.script)) return null

    const pubkeyhash = extractP2PKHLockScriptPubkeyhash(this.script)
    const testnet = require('../index').testnet

    return new Address(pubkeyhash, testnet)
  }
}

// ------------------------------------------------------------------------------------------------

Transaction.Input = Input
Transaction.Output = Output

module.exports = Transaction
