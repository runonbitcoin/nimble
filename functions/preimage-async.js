const preimage = require('./preimage')

async function preimageAsync (tx, vin, parentScript, parentSatoshis, sighashFlags) {
  return await preimage(tx, vin, parentScript, parentSatoshis, sighashFlags, true)
}

module.exports = preimageAsync