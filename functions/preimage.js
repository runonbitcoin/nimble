const BufferWriter = require('../classes/buffer-writer')
const writeU32LE = require('./write-u32-le')
const writeU64LE = require('./write-u64-le')
const writeVarint = require('./write-varint')
const decodeHex = require('./decode-hex')
const sha256d = require('./sha256d')
const sha256Async = require('./sha256-async')

function preimage (tx, vin, parentScript, parentSatoshis, sighashFlags, async) {
  const input = tx.inputs[vin]
  const outputs = tx.outputs || []

  const SIGHASH_NONE = 0x02
  const SIGHASH_SINGLE = 0x03
  const SIGHASH_ANYONECANPAY = 0x80

  function getPrevoutsHash () {
    if (tx._hashPrevouts) return tx._hashPrevouts
    const writer = new BufferWriter()
    tx.inputs.forEach(input => {
      writer.write(decodeHex(input.txid).reverse())
      writeU32LE(writer, input.vout)
    })
    const preimage = writer.toBuffer()
    tx._hashPrevouts = async ? sha256Async(preimage).then(sha256Async) : sha256d(preimage)
    return tx._hashPrevouts
  }

  function getSequenceHash () {
    if (tx._hashSequence) return tx._hashSequence
    const writer = new BufferWriter()
    tx.inputs.forEach(input => {
      writeU32LE(writer, typeof input.sequence === 'undefined' ? 0xFFFFFFFF : input.sequence)
    })
    const preimage = writer.toBuffer()
    tx._hashSequence = async ? sha256Async(preimage).then(sha256Async) : sha256d(preimage)
    return tx._hashSequence
  }

  function getAllOutputsHash () {
    if (tx._hashOutputsAll) return tx._hashOutputsAll
    const writer = new BufferWriter()
    outputs.forEach(output => {
      writeU64LE(writer, output.satoshis)
      writeVarint(writer, output.script.length)
      writer.write(output.script)
    })
    const preimage = writer.toBuffer()
    tx._hashOutputsAll = async ? sha256Async(preimage).then(sha256Async) : sha256d(preimage)
    return tx._hashOutputsAll
  }

  function getOutputHash (n) {
    const output = outputs[n]
    const writer = new BufferWriter()
    writeU64LE(writer, output.satoshis)
    writeVarint(writer, output.script.length)
    writer.write(output.script)
    const preimage = writer.toBuffer()
    return async ? sha256Async(preimage).then(sha256Async) : sha256d(preimage)
  }

  let hashPrevouts = new Uint8Array(32)
  let hashSequence = new Uint8Array(32)
  let hashOutputs = new Uint8Array(32)

  if (!(sighashFlags & SIGHASH_ANYONECANPAY)) {
    hashPrevouts = getPrevoutsHash()
  }

  if (!(sighashFlags & SIGHASH_ANYONECANPAY) &&
             (sighashFlags & 0x1F) !== SIGHASH_SINGLE &&
             (sighashFlags & 0x1F) !== SIGHASH_NONE) {
    hashSequence = getSequenceHash()
  }

  if ((sighashFlags & 0x1F) !== SIGHASH_SINGLE && (sighashFlags & 0x1F) !== SIGHASH_NONE) {
    hashOutputs = getAllOutputsHash()
  } else if ((sighashFlags & 0x1F) === SIGHASH_SINGLE && vin < outputs.length) {
    hashOutputs = getOutputHash(vin)
  }

  function getPreimage (hashPrevouts, hashSequence, hashOutputs) {
    const writer = new BufferWriter()
    writeU32LE(writer, typeof tx.version === 'undefined' ? 1 : tx.version)
    writer.write(hashPrevouts)
    writer.write(hashSequence)
    writer.write(decodeHex(input.txid).reverse())
    writeU32LE(writer, input.vout)
    writeVarint(writer, parentScript.length)
    writer.write(parentScript)
    writeU64LE(writer, parentSatoshis)
    writeU32LE(writer, typeof input.sequence === 'undefined' ? 0xFFFFFFFF : input.sequence)
    writer.write(hashOutputs)
    writeU32LE(writer, tx.locktime || 0)
    writeU32LE(writer, sighashFlags >>> 0)
    return writer.toBuffer()
  }

  if (async) {
    return Promise.all([hashPrevouts, hashSequence, hashOutputs]).then(args => getPreimage(...args))
  } else {
    return getPreimage(hashPrevouts, hashSequence, hashOutputs)
  }
}

module.exports = preimage
