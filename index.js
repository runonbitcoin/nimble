/* global VERSION */
/* global VARIANT */

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
nimble.feePerKb = 50

nimble.version =
  typeof VERSION === 'undefined' ? require('./package.json').version : VERSION
nimble.variant = typeof VARIANT === 'undefined' ? undefined : VARIANT

module.exports = nimble
