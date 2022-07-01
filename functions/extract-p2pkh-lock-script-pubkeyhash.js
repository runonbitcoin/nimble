function extractP2PKHLockScriptPubkeyhash(script) {
  return script.slice(3, 23)
}

module.exports = extractP2PKHLockScriptPubkeyhash
