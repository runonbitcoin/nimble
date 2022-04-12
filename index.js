/* global VERSION */

const nimble = {}

nimble.Address = require('./classes/address')
nimble.PublicKey = require('./classes/public-key')
nimble.PrivateKey = require('./classes/private-key')
nimble.Script = require('./classes/script')
nimble.Transaction = require('./classes/transaction')

nimble.classes = require('./classes')
nimble.constants = require('./constants')
nimble.functions = require('./functions')

nimble.testnet = false
nimble.feePerKB = 250
nimble.version = typeof VERSION === 'undefined' ? require('./package.json').version : VERSION

module.exports = nimble
