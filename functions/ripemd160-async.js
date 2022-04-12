const asyncify = require('./asyncify')
const ripemd160 = require('./ripemd160')

module.exports = asyncify(ripemd160)
