/* global VARIANT */

// Provides the build of nimble for testing

const path = require('path')

const nimble = process.env.LIB ? require(path.join(process.cwd(), process.env.LIB)) : require('target')

if (typeof VARIANT === 'undefined' && process) {
  global.VARIANT = 'node'
}

module.exports = nimble
