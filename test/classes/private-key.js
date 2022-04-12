/**
 * private-key.js
 *
 * Tests for PrivateKey
 */

const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { PrivateKey } = nimble
const { encodeBase58Check } = nimble.functions
const bsv = require('bsv')

// ------------------------------------------------------------------------------------------------
// PrivateKey
// ------------------------------------------------------------------------------------------------

describe('PrivateKey', () => {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  describe('constructor', () => {
    // TODO
  })

  // --------------------------------------------------------------------------
  // fromString
  // --------------------------------------------------------------------------

  describe('fromString', () => {
    it('parses WIF', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      expect(privateKey.testnet).to.equal(false)
      expect(privateKey.compressed).to.equal(bsvPrivateKey.compressed)
      expect([...privateKey.number]).to.deep.equal([...bsvPrivateKey.toBuffer()])
    })

    // ------------------------------------------------------------------------

    it('throws if not a string', () => {
      expect(() => PrivateKey.fromString()).to.throw('Cannot create PrivateKey: not a string')
    })

    // ------------------------------------------------------------------------

    it('throws if invalid WIF', () => {
      const invalidPrivateKey = encodeBase58Check(0, [])
      expect(() => PrivateKey.fromString(invalidPrivateKey)).to.throw('Cannot create PrivateKey: bad payload')
    })

    // ------------------------------------------------------------------------

    it('is immutable', () => {
      const wif = PrivateKey.fromRandom().toString()
      const privateKey = PrivateKey.fromString(wif)
      expect(Object.isFrozen(privateKey)).to.equal(true)
    })
  })

  // --------------------------------------------------------------------------
  // fromRandom
  // --------------------------------------------------------------------------

  describe('fromRandom', () => {
    it('generates random', () => {
      const privateKey1 = PrivateKey.fromRandom()
      const privateKey2 = PrivateKey.fromRandom()
      expect(privateKey1.number).not.to.deep.equal(privateKey2.number)
    })

    // ------------------------------------------------------------------------

    it('is immutable', () => {
      const privateKey = PrivateKey.fromRandom()
      expect(Object.isFrozen(privateKey)).to.equal(true)
    })
  })

  // --------------------------------------------------------------------------
  // toString
  // --------------------------------------------------------------------------

  describe('toString', () => {
    it('returns WIF', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      expect(privateKey.toString()).to.equal(bsvPrivateKey.toString())
    })

    // ------------------------------------------------------------------------

    it('caches wif string', () => {
      const privateKey = PrivateKey.fromRandom()
      const t0 = new Date()
      privateKey.toString()
      const t1 = new Date()
      privateKey.toString()
      const t2 = new Date()
      expect(t2 - t1).to.be.lessThanOrEqual(t1 - t0)
    })
  })

  // --------------------------------------------------------------------------
  // toPublicKey
  // --------------------------------------------------------------------------

  describe('toPublicKey', () => {
    it('calculates public key', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const bsvPublicKey = bsvPrivateKey.toPublicKey()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      const publicKey = privateKey.toPublicKey()
      expect(publicKey.toString()).to.equal(bsvPublicKey.toString())
    })

    // ------------------------------------------------------------------------

    it('caches public key', () => {
      const privateKey = PrivateKey.fromRandom()
      const t0 = new Date()
      const publicKey1 = privateKey.toPublicKey()
      const t1 = new Date()
      const publicKey2 = privateKey.toPublicKey()
      const t2 = new Date()
      expect(t2 - t1).to.be.lessThanOrEqual(t1 - t0)
      expect(publicKey1).to.equal(publicKey2)
    })
  })

  // --------------------------------------------------------------------------
  // toAddress
  // --------------------------------------------------------------------------

  describe('toAddress', () => {
    it('mainnet', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const bsvAddress = bsvPrivateKey.toAddress()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      const address = privateKey.toAddress()
      expect(address.toString()).to.equal(bsvAddress.toString())
    })

    // ------------------------------------------------------------------------

    it('testnet', () => {
      const bsvPrivateKey = new bsv.PrivateKey('testnet')
      const bsvAddress = bsvPrivateKey.toAddress()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      const address = privateKey.toAddress()
      expect(address.toString()).to.equal(bsvAddress.toString())
    })
  })
})

// ------------------------------------------------------------------------------------------------
