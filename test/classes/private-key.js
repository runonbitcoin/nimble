const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { PrivateKey } = nimble
const { encodeBase58Check } = nimble.functions
const bsv = require('bsv')

describe('PrivateKey', () => {
  describe('constructor', () => {
    it('valid', () => {
      const number = nimble.functions.generatePrivateKey()
      const privateKey = new PrivateKey(number, true, false)
      expect(privateKey.number).to.equal(number)
      expect(privateKey.testnet).to.equal(true)
      expect(privateKey.compressed).to.equal(false)
    })

    it('throws if bad', () => {
      const number = nimble.functions.generatePrivateKey()
      expect(() => new PrivateKey(null, true, true)).to.throw('bad number')
      expect(() => new PrivateKey(0, true, true)).to.throw('bad number')
      expect(() => new PrivateKey(number, 1, true)).to.throw('bad testnet flag')
      expect(() => new PrivateKey(number, false, undefined)).to.throw('bad compressed flag')
      expect(() => new PrivateKey([], true, true)).to.throw('bad length')
      expect(() => new PrivateKey(new Array(33), true, true)).to.throw('bad length')
      expect(() => new PrivateKey(new Array(32).fill(255), true, true)).to.throw('outside range')
    })
  })

  describe('fromString', () => {
    it('parses WIF', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      expect(privateKey.testnet).to.equal(false)
      expect(privateKey.compressed).to.equal(bsvPrivateKey.compressed)
      expect([...privateKey.number]).to.deep.equal([...bsvPrivateKey.toBuffer()])
    })

    it('throws if not a string', () => {
      expect(() => PrivateKey.fromString()).to.throw('not a string')
    })

    it('throws if bad WIF', () => {
      const badPrivateKey = encodeBase58Check(0, [])
      expect(() => PrivateKey.fromString(badPrivateKey)).to.throw('bad length')
    })

    it('is immutable', () => {
      const wif = PrivateKey.fromRandom().toString()
      const privateKey = PrivateKey.fromString(wif)
      expect(Object.isFrozen(privateKey)).to.equal(true)
    })
  })

  describe('fromRandom', () => {
    it('generates random', () => {
      const privateKey1 = PrivateKey.fromRandom()
      const privateKey2 = PrivateKey.fromRandom()
      expect(privateKey1.number).not.to.deep.equal(privateKey2.number)
    })

    it('is immutable', () => {
      const privateKey = PrivateKey.fromRandom()
      expect(Object.isFrozen(privateKey)).to.equal(true)
    })

    it('testnet', () => {
      const privateKey = PrivateKey.fromRandom(true)
      expect(privateKey.testnet).to.equal(true)
    })
  })

  describe('from', () => {
    it('from PrivateKey instance', () => {
      const privateKey = PrivateKey.fromRandom()
      expect(PrivateKey.from(privateKey)).to.equal(privateKey)
    })

    it('from bsv.PrivateKey', () => {
      const privateKey = PrivateKey.fromRandom()
      const bsvPrivateKey = new bsv.PrivateKey(privateKey.toString())
      expect(PrivateKey.from(bsvPrivateKey).toString()).to.equal(privateKey.toString())
    })

    it('from string', () => {
      const privateKey = PrivateKey.fromRandom()
      expect(PrivateKey.from(privateKey.toString()).toString()).to.equal(privateKey.toString())
    })

    it('throws if unsupported', () => {
      expect(() => PrivateKey.from()).to.throw()
      expect(() => PrivateKey.from(null)).to.throw()
      expect(() => PrivateKey.from('abc')).to.throw()
    })
  })

  describe('toString', () => {
    it('returns WIF', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      expect(privateKey.toString()).to.equal(bsvPrivateKey.toString())
    })

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

  describe('toPublicKey', () => {
    it('calculates public key', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const bsvPublicKey = bsvPrivateKey.toPublicKey()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      const publicKey = privateKey.toPublicKey()
      expect(publicKey.toString()).to.equal(bsvPublicKey.toString())
    })

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

  describe('toAddress', () => {
    it('mainnet', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const bsvAddress = bsvPrivateKey.toAddress()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      const address = privateKey.toAddress()
      expect(address.toString()).to.equal(bsvAddress.toString())
    })

    it('testnet', () => {
      const bsvPrivateKey = new bsv.PrivateKey('testnet')
      const bsvAddress = bsvPrivateKey.toAddress()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      const address = privateKey.toAddress()
      expect(address.toString()).to.equal(bsvAddress.toString())
    })
  })
})
