const { describe, it } = require('mocha')
const nimble = require('../env/nimble')
const { PublicKey, PrivateKey } = nimble
const bsv = require('bsv')
const { expect } = require('chai')

describe('PublicKey', () => {
  describe('constructor', () => {
    // TODO
  })

  describe('fromString', () => {
    it('parses string', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const bsvPublicKey = bsvPrivateKey.toPublicKey()
      const publicKey = PublicKey.fromString(bsvPublicKey.toString())
      expect(publicKey.compressed).to.equal(bsvPublicKey.compressed)
      expect(publicKey.testnet).to.equal(false)
      expect([...publicKey.point.x]).to.deep.equal([...bsvPublicKey.point.x.toArray()])
      expect([...publicKey.point.y]).to.deep.equal([...bsvPublicKey.point.y.toArray()])
    })

    it('throws if not a string', () => {
      expect(() => PublicKey.fromString()).to.throw('Cannot create PublicKey: not a hex string')
      expect(() => PublicKey.fromString(null)).to.throw('Cannot create PublicKey: not a hex string')
      expect(() => PublicKey.fromString({})).to.throw('Cannot create PublicKey: not a hex string')
    })

    it('throws if too short', () => {
      expect(() => PublicKey.fromString('01')).to.throw('Cannot create PublicKey: too short')
    })

    it('is immutable', () => {
      const privateKey = PrivateKey.fromRandom()
      const publicKey = PublicKey.fromString(privateKey.toPublicKey().toString())
      expect(Object.isFrozen(publicKey)).to.equal(true)
    })
  })

  describe('fromPrivateKey', () => {
    it('creates from private key', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const bsvPublicKey = bsvPrivateKey.toPublicKey()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      const publicKey = PublicKey.fromPrivateKey(privateKey)
      expect(bsvPublicKey.toString()).equal(publicKey.toString())
    })

    it('throws if not a private key', () => {
      expect(() => PublicKey.fromPrivateKey()).to.throw('Not a PrivateKey: ')
    })

    it('caches public key', () => {
      const privateKey = PrivateKey.fromRandom()
      const t0 = new Date()
      const publicKey1 = PublicKey.fromPrivateKey(privateKey)
      const t1 = new Date()
      const publicKey2 = PublicKey.fromPrivateKey(privateKey)
      const t2 = new Date()
      expect(t2 - t1).to.be.lessThanOrEqual(t1 - t0)
      expect(publicKey1).to.equal(publicKey2)
    })

    it('is immutable', () => {
      const privateKey = PrivateKey.fromRandom()
      const publicKey = PublicKey.fromPrivateKey(privateKey)
      expect(Object.isFrozen(publicKey)).to.equal(true)
    })
  })

  describe('toString', () => {
    it('compressed', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const bsvPublicKey = bsvPrivateKey.toPublicKey()
      expect(bsvPublicKey.compressed).to.equal(true)
      const publicKey = PublicKey.fromString(bsvPublicKey.toString())
      expect(publicKey.compressed).to.equal(true)
      expect(publicKey.toString()).to.equal(bsvPublicKey.toString())
    })

    it('uncompressed', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const bsvPublicKey = new bsv.PublicKey(bsvPrivateKey.toPublicKey().point, { compressed: false })
      expect(bsvPublicKey.compressed).to.equal(false)
      const publicKey = PublicKey.fromString(bsvPublicKey.toString())
      expect(publicKey.compressed).to.equal(false)
      expect(publicKey.toString()).to.equal(bsvPublicKey.toString())
    })

    it('caches string', () => {
      const publicKey = PrivateKey.fromRandom().toPublicKey()
      const t0 = new Date()
      publicKey.toAddress()
      const t1 = new Date()
      publicKey.toAddress()
      const t2 = new Date()
      expect(t2 - t1).to.be.lessThanOrEqual(t1 - t0)
    })
  })

  describe('toAddress', () => {
    it('mainnet', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const bsvAddress = bsvPrivateKey.toAddress()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      const address = privateKey.toAddress()
      expect(address.testnet).to.equal(false)
      expect(address.toString()).to.equal(bsvAddress.toString())
    })

    it('testnet', () => {
      const bsvPrivateKey = new bsv.PrivateKey('testnet')
      const bsvAddress = bsvPrivateKey.toAddress()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      const address = privateKey.toAddress()
      expect(address.testnet).to.equal(true)
      expect(address.toString()).to.equal(bsvAddress.toString())
    })
  })
})
