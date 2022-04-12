const BASE58_CHARS = require('../constants/base58-chars')

function decodeBase58 (s) {
  if (typeof s !== 'string') throw new Error('not a string')
  // Credit: https://gist.github.com/diafygi/90a3e80ca1c2793220e5/
  const d = [] // the array for storing the stream of decoded bytes
  const b = [] // the result byte array that will be returned
  let j // the iterator variable for the byte array (d)
  let c // the carry amount variable that is used to overflow from the current byte to the next byte
  let n // a temporary placeholder variable for the current byte
  for (let i = 0; i < s.length; i++) {
    j = 0 // reset the byte iterator
    c = BASE58_CHARS.indexOf(s[i]) // set the initial carry amount equal to the current base58 digit
    if (c < 0) throw new Error('bad base58 chars')
    if (!(c || b.length ^ i)) b.push(0) // prepend the result array with a zero if the base58 digit is zero and non-zero characters haven't been seen yet (to ensure correct decode length)
    while (j in d || c) { // start looping through the bytes until there are no more bytes and no carry amount
      n = d[j] // set the placeholder for the current byte
      n = n ? n * 58 + c : c // shift the current byte 58 units and add the carry amount (or just add the carry amount if this is a new byte)
      c = n >> 8 // find the new carry amount (1-byte shift of current byte value)
      d[j] = n % 256 // reset the current byte to the remainder (the carry amount will pass on the overflow)
      j++ // iterate to the next byte
    }
  }
  while (j--) { b.push(d[j]) } // since the byte array is backwards, loop through it in reverse order, and append
  return b
}

module.exports = decodeBase58
