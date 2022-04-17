function calculateDust (scriptLen, feePerKb = require('../index').feePerKb) {
  // See: https://github.com/bitcoin-sv/bitcoin-sv/blob/782c043fb39060bfc12179792a590b6405b91f3c/src/primitives/transaction.h

  const outputLen = 8 + (scriptLen < 76 ? 1 : scriptLen < 0xFF ? 2 : scriptLen < 0xFFFF ? 3 : 5) + scriptLen
  const p2pkhInputLen = 148
  const nSize = outputLen + p2pkhInputLen

  return Math.ceil(3 * nSize * feePerKb / 1000)
}

module.exports = calculateDust
