const encodeTx = require('./encode-tx')
const verifyScript = require('./verify-script')

function verifyTx (tx, parents, minFeePerKb) {
  const version = typeof tx.version !== 'undefined' ? tx.version : 1
  const locktime = typeof tx.locktime !== 'undefined' ? tx.locktime : 0

  if (version !== 1) throw new Error('bad version')
  if (locktime < 0 || locktime > 0xffffffff || !Number.isInteger(locktime)) throw new Error('bad locktime')

  if (tx.inputs.length === 0) throw new Error('no inputs')
  if (tx.outputs.length === 0) throw new Error('no outputs')

  const inputSatoshis = parents.reduce((prev, curr) => prev + curr.satoshis, 0)
  const outputSatoshis = tx.outputs.reduce((prev, curr) => prev + curr.satoshis, 0)
  if (inputSatoshis - outputSatoshis < encodeTx(tx).length * minFeePerKb / 1000) throw new Error('insufficient priority')

  tx.inputs.forEach((input, vin) => {
    tx.inputs.slice(vin + 1).forEach((input2) => {
      if (input.txid === input2.txid && input.vout === input2.vout) throw new Error('duplicate input')
    })
  })

  tx.inputs.forEach((input, vin) => {
    verifyScript(input.script, parents[vin].script, tx, vin, parents[vin].satoshis)
  })
}

module.exports = verifyTx
