function isBuffer(a) {
  // This covers both Uint8Array and Buffer instances
  if (a instanceof Uint8Array) return true

  // Check if a standard array, which is slower than the above checks
  return (
    Array.isArray(a) && !a.some((x) => !Number.isInteger(x) || x < 0 || x > 255)
  )
}

module.exports = isBuffer
