const encodeHex = require('./encode-hex')
const sha256d = require('./sha256d')

function calculateTxid (buffer) {
  return encodeHex(sha256d(buffer).reverse())
}

module.exports = calculateTxid
