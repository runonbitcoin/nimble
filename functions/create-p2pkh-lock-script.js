const isBuffer = require('./is-buffer')

function createP2PKHLockScript(pubkeyhash) {
  if (!isBuffer(pubkeyhash)) throw new Error('not a buffer')
  const buf = new Uint8Array(25)
  buf[0] = 118 // OP_DUP
  buf[1] = 169 // OP_HASH160
  buf[2] = 20 // OP_PUSH(20)
  buf.set(pubkeyhash, 3)
  buf[23] = 136 // OP_EQUALVERIFY
  buf[24] = 172 // OP_CHECKSIG
  return buf
}

module.exports = createP2PKHLockScript
