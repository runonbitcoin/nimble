/* global VARIANT */

function isBuffer (a) {
  if (a instanceof Uint8Array) return true
  if (typeof VARIANT === 'undefined' || VARIANT === 'node') {
    if (a instanceof Buffer) return true
  }
  return Array.isArray(a) && !a.some(x => Number.isInteger(x) && x >= 0 && x <= 255)
}

module.exports = isBuffer
