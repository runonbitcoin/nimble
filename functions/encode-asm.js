const decodeScriptChunks = require('./decode-script-chunks')
const encodeHex = require('./encode-hex')
const opcodes = require('../constants/opcodes')

const OPCODE_MAP = []

Object.entries(opcodes).forEach(([value, key]) => {
  OPCODE_MAP[key] = value
})

function encodeASM(script) {
  const chunks = decodeScriptChunks(script)

  return chunks
    .map((chunk) => {
      if (chunk.buf) {
        return encodeHex(chunk.buf) || '0'
      } else if (chunk.opcode === opcodes.OP_1NEGATE) {
        return '-1'
      } else {
        return OPCODE_MAP[chunk.opcode] || `<unknown opcode ${chunk.opcode}>`
      }
    })
    .join(' ')
}

module.exports = encodeASM
