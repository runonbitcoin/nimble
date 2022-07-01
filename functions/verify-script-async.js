const verifyScript = require('./verify-script')

function verifyScriptAsync(unlockScript, lockScript, tx, vin, parentSatoshis) {
  return verifyScript(unlockScript, lockScript, tx, vin, parentSatoshis, true)
}

module.exports = verifyScriptAsync
