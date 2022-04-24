const preimage = require('./preimage')
const preimageAsync = require('./preimage-async')
const sha256d = require('./sha256d')
const sha256Async = require('./sha256-async')

function sighash (tx, vin, parentScript, parentSatoshis, sighashFlags, async) {
  if (async) {
    return preimageAsync(tx, vin, parentScript, parentSatoshis, sighashFlags)
      .then(sha256Async)
      .then(sha256Async)
  } else {
    return sha256d(preimage(tx, vin, parentScript, parentSatoshis, sighashFlags))
  }
}

module.exports = sighash
