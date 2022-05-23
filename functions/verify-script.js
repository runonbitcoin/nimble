const evalScript = require('./eval-script')

function verifyScript (unlockScript, lockScript, tx, vin, parentSatoshis, async = false) {
  const vm = evalScript(unlockScript, lockScript, tx, vin, parentSatoshis, { async, trace: false })

  if (async) {
    return vm.then(vm => {
      return vm.error ? Promise.reject(vm.error) : vm.success
    })
  } else {
    if (vm.error) throw vm.error
    return vm.success
  }
}

module.exports = verifyScript
