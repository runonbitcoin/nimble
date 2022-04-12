const asyncify = require('./asyncify')
const ecdsaSign = require('./ecdsa-sign')

module.exports = asyncify(ecdsaSign)
