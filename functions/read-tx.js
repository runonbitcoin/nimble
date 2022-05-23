const encodeHex = require('./encode-hex')
const readU32LE = require('./read-u32-le')
const readU64LE = require('./read-u64-le')
const readVarint = require('./read-varint')

function readTx (reader) {
  const version = readU32LE(reader)

  const nin = readVarint(reader)
  const inputs = []
  for (let vin = 0; vin < nin; vin++) {
    const txid = encodeHex(new Uint8Array(reader.read(32)).reverse())
    const vout = readU32LE(reader)
    const scriptLength = readVarint(reader)
    const script = reader.read(scriptLength)
    const sequence = readU32LE(reader)

    const input = { txid, vout, script, sequence }
    inputs.push(input)
  }

  const nout = readVarint(reader)
  const outputs = []
  for (let vout = 0; vout < nout; vout++) {
    const satoshis = readU64LE(reader)
    const scriptLength = readVarint(reader)
    const script = reader.read(scriptLength)

    const output = { satoshis, script }
    outputs.push(output)
  }

  const locktime = readU32LE(reader)

  return { version, inputs, outputs, locktime }
}

module.exports = readTx
