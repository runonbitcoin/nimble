const decodeBase58Check = require('./decode-base58-check')

function decodeAddress (address) {
  const { version, payload } = decodeBase58Check(address)

  if (payload.length !== 20) throw new Error('bad payload')
  if (version !== 0x00 && version !== 0x6f) throw new Error('unsupported version')

  return {
    testnet: version !== 0,
    pubkeyhash: payload
  }
}

module.exports = decodeAddress
