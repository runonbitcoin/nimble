const { describe, it } = require('mocha')
const nimble = require('../env/nimble')
const { PublicKey, PrivateKey } = nimble
const bsv = require('bsv')
const { expect } = require('chai')

describe('PublicKey', () => {
  describe('constructor', () => {
    it('valid', () => {
      const privateKey = nimble.functions.generatePrivateKey()
      const publicKeyPoint = nimble.functions.calculatePublicKey(privateKey)
      const publicKey = new PublicKey(publicKeyPoint, true, false)
      expect(publicKey.point).to.equal(publicKeyPoint)
      expect(publicKey.testnet).to.equal(true)
      expect(publicKey.compressed).to.equal(false)
    })

    it('throws if bad', () => {
      const privateKey = nimble.functions.generatePrivateKey()
      const publicKeyPoint = nimble.functions.calculatePublicKey(privateKey)
      expect(() => new PublicKey(0, true, true)).to.throw('bad point')
      expect(() => new PublicKey('', true, true)).to.throw('bad point')
      expect(() => new PublicKey({}, true, true)).to.throw('bad point')
      expect(() => new PublicKey({ x: [], y: publicKeyPoint.y }, true, true)).to.throw('not on curve')
      expect(() => new PublicKey({ x: publicKeyPoint.x, y: 1 }, true, true)).to.throw('bad point')
      expect(() => new PublicKey(publicKeyPoint, 0, true)).to.throw('bad testnet flag')
      expect(() => new PublicKey(publicKeyPoint, 'testnet', true)).to.throw('bad testnet flag')
      expect(() => new PublicKey(publicKeyPoint, true, 'compressed')).to.throw('bad compressed flag')
    })
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
      expect(() => PublicKey.fromString()).to.throw('not a string')
      expect(() => PublicKey.fromString(null)).to.throw('not a string')
      expect(() => PublicKey.fromString({})).to.throw('not a string')
    })

    it('throws if too short', () => {
      expect(() => PublicKey.fromString('02')).to.throw('bad length')
    })

    it('throws if not on curve', () => {
      const privateKey = nimble.functions.generatePrivateKey()
      const publicKey = nimble.functions.calculatePublicKey(privateKey)
      publicKey.y = publicKey.x
      const compressed = nimble.functions.encodeHex(nimble.functions.encodePublicKey(publicKey, false))
      expect(() => PublicKey.fromString(compressed)).to.throw('not on curve')
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
      expect(() => PublicKey.fromPrivateKey()).to.throw('not a PrivateKey: ')
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

  describe('from', () => {
    it('from PublicKey instance', () => {
      const publicKey = PrivateKey.fromRandom().toPublicKey()
      expect(PublicKey.from(publicKey)).to.equal(publicKey)
    })

    it('from bsv.PublicKey', () => {
      const publicKey = PrivateKey.fromRandom().toPublicKey()
      const bsvPublicKey = new bsv.PublicKey(publicKey.toString())
      expect(PublicKey.from(bsvPublicKey).toString()).to.equal(publicKey.toString())
    })

    it('from string', () => {
      const publicKey = PrivateKey.fromRandom().toPublicKey()
      expect(PublicKey.from(publicKey.toString()).toString()).to.equal(publicKey.toString())
    })

    it('from PrivateKey instance', () => {
      const privateKey = PrivateKey.fromRandom()
      expect(PublicKey.from(privateKey).toString()).to.equal(privateKey.toPublicKey().toString())
    })

    it('throws if unsupported', () => {
      expect(() => PublicKey.from()).to.throw()
      expect(() => PublicKey.from(null)).to.throw()
      expect(() => PublicKey.from('abc')).to.throw()
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
