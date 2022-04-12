const asyncify = require('./asyncify')
const ecdsaVerify = require('./ecdsa-verify')

module.exports = asyncify(ecdsaVerify)
