const decodeHex = require('./decode-hex')
const writeU32LE = require('./write-u32-le')
const writeU64LE = require('./write-u64-le')
const writeVarint = require('./write-varint')

function writeTx(writer, tx) {
  const version = typeof tx.version === 'undefined' ? 1 : tx.version
  const inputs = tx.inputs || []
  const outputs = tx.outputs || []
  const locktime = typeof tx.locktime === 'undefined' ? 0 : tx.locktime

  writeU32LE(writer, version)

  writeVarint(writer, inputs.length)
  for (const input of inputs) {
    const script = typeof input.script === 'undefined' ? [] : input.script
    const sequence =
      typeof input.sequence === 'undefined' ? 0xffffffff : input.sequence
    writer.write(decodeHex(input.txid).reverse())
    writeU32LE(writer, input.vout)
    writeVarint(writer, script.length)
    writer.write(script)
    writeU32LE(writer, sequence)
  }

  writeVarint(writer, outputs.length)
  for (const output of outputs) {
    writeU64LE(writer, output.satoshis)
    writeVarint(writer, output.script.length)
    writer.write(output.script)
  }

  writeU32LE(writer, locktime)

  return this
}

module.exports = writeTx
