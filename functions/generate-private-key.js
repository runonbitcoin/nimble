const generateRandomData = require('./generate-random-data')
const verifyPrivateKey = require('./verify-private-key')

function generatePrivateKey() {
  while (true) {
    try {
      return verifyPrivateKey(generateRandomData(32))
    } catch (e) {
      continue
    }
  }
}

module.exports = generatePrivateKey
