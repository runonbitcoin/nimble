function isP2PKHLockScript (script) {
  return script.length === 25 &&
    script[0] === 118 && // OP_DUP
    script[1] === 169 && // OP_HASH160
    script[2] === 20 && // OP_PUSH(20)
    script[23] === 136 && // OP_EQUALVERIFY
    script[24] === 172 // OP_CHECKSIG
}

module.exports = isP2PKHLockScript
