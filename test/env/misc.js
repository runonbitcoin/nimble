/**
 * misc.js
 *
 * Test helpers
 */

const { expect } = require('chai')

// ------------------------------------------------------------------------------------------------
// expectFlat
// ------------------------------------------------------------------------------------------------

function expectFlat (actual, expected) {
  let pos = 0
  actual.forEach(arr => {
    arr.forEach(x => {
      expect(x).to.equal(expected[pos++])
    })
  })
  expect(pos).to.equal(expected.length)
}

// ------------------------------------------------------------------------------------------------

module.exports = { expectFlat }
