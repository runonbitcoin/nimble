/* global VARIANT */

function decodeHex (hex) {
  if (typeof hex !== 'string') throw new Error('not a hex string')

  if (hex.length % 2 === 1) hex = '0' + hex

  if (typeof VARIANT === 'undefined' || VARIANT === 'node') {
    return Buffer.from(hex, 'hex')
  } else {
    const length = hex.length / 2
    const arr = new Uint8Array(length)
    const isNaN = x => x !== x // eslint-disable-line no-self-compare
    for (let i = 0; i < length; ++i) {
      const byte = parseInt(hex.substr(i * 2, 2), 16)
      if (isNaN(byte)) throw new Error('bad hex char')
      arr[i] = byte
    }
    return arr
  }
}

module.exports = decodeHex
