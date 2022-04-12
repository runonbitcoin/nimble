const BASE58_CHARS = require('../constants/base58-chars')

function encodeBase58 (payload) {
// Credit: https://gist.github.com/diafygi/90a3e80ca1c2793220e5/
  const d = [] // the array for storing the stream of base58 digits
  let s = '' // the result string variable that will be returned
  let i // the iterator variable for the byte input
  let j // the iterator variable for the base58 digit array (d)
  let c // the carry amount variable that is used to overflow from the current base58 digit to the next base58 digit
  let n // a temporary placeholder variable for the current base58 digit
  for (i in payload) { // loop through each byte in the input stream
    j = 0 // reset the base58 digit iterator
    c = payload[i] // set the initial carry amount equal to the current byte amount
    s += c || s.length ^ i ? '' : 1 // prepend the result string with a "1" (0 in base58) if the byte stream is zero and non-zero bytes haven't been seen yet (to ensure correct decode length)
    while (j in d || c) { // start looping through the digits until there are no more digits and no carry amount
      n = d[j] // set the placeholder for the current base58 digit
      n = n ? n * 256 + c : c // shift the current base58 one byte and add the carry amount (or just add the carry amount if this is a new digit)
      c = n / 58 | 0 // find the new carry amount (floored integer of current digit divided by 58)
      d[j] = n % 58 // reset the current base58 digit to the remainder (the carry amount will pass on the overflow)
      j++ // iterate to the next base58 digit
    }
  }
  while (j--) { // since the base58 digits are backwards, loop through them in reverse order
    s += BASE58_CHARS[d[j]]// lookup the character associated with each base58 digit
  }
  return s // return the final base58 string
}

module.exports = encodeBase58
