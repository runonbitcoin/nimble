const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { Address, PrivateKey, Script } = nimble
const { encodeBase58Check, createP2PKHLockScript } = nimble.functions
const bsv = require('bsv')

describe('Address', () => {
  describe('constructor', () => {
    it('valid', () => {
      const privateKey = nimble.functions.generatePrivateKey()
      const publicKey = nimble.functions.calculatePublicKey(privateKey)
      const pubkeyhash = nimble.functions.calculatePublicKeyHash(publicKey)
      const address = new Address(pubkeyhash, true)
      expect(address.pubkeyhash).to.equal(pubkeyhash)
      expect(address.testnet).to.equal(true)
    })

    it('throws if bad', () => {
      expect(() => new Address('abc', true)).to.throw('bad pubkeyhash')
      expect(() => new Address([], false)).to.throw('bad pubkeyhash')
      expect(() => new Address(new Array(20), 0)).to.throw('bad testnet flag')
    })
  })

  describe('fromString', () => {
    it('decodes valid mainnet address', () => {
      const bsvAddress = new bsv.PrivateKey().toAddress()
      const address = Address.fromString(bsvAddress.toString())
      expect(address.testnet).to.equal(false)
      expect(Buffer.from(bsvAddress.hashBuffer).toString('hex')).to.equal(Buffer.from(address.pubkeyhash).toString('hex'))
    })

    it('decodes valid testnet address', () => {
      const bsvAddress = new bsv.PrivateKey(undefined, 'testnet').toAddress()
      const address = Address.fromString(bsvAddress.toString())
      expect(address.testnet).to.equal(true)
      expect(Buffer.from(bsvAddress.hashBuffer).toString('hex')).to.equal(Buffer.from(address.pubkeyhash).toString('hex'))
    })

    it('throws if bad checksum', () => {
      expect(() => Address.fromString('1JMckZqEF3194i3TCe2eJrvLyL74RAJ36k')).to.throw('bad checksum')
    })

    it('throws if not a string', () => {
      expect(() => Address.fromString()).to.throw('not a string')
      expect(() => Address.fromString(null)).to.throw('not a string')
      expect(() => Address.fromString(Address.fromString(new bsv.PrivateKey().toAddress()))).to.throw('not a string')
    })

    it('throws if bad chars', () => {
      expect(() => Address.fromString('!JMckZqEF3194i3TCe2eJrvLyL74RAJ36k')).to.throw('bad base58 chars')
    })

    it('throws if bad length', () => {
      const badLengthAddress = encodeBase58Check(0, [])
      expect(() => Address.fromString(badLengthAddress)).to.throw('bad payload')
    })

    it('is immutable', () => {
      const address = Address.fromString(PrivateKey.fromRandom().toAddress().toString())
      expect(Object.isFrozen(address)).to.equal(true)
    })
  })

  describe('fromPublicKey', () => {
    it('computes address', () => {
      const bsvPrivateKey = new bsv.PrivateKey()
      const bsvAddress = bsvPrivateKey.toAddress()
      const privateKey = PrivateKey.fromString(bsvPrivateKey.toString())
      const address = privateKey.toAddress()
      expect(address.toString()).to.equal(bsvAddress.toString())
    })

    it('caches address', () => {
      const publicKey = PrivateKey.fromRandom().toPublicKey()
      const t0 = new Date()
      const address1 = Address.fromPublicKey(publicKey)
      const t1 = new Date()
      const address2 = Address.fromPublicKey(publicKey)
      const t2 = new Date()
      expect(t2 - t1).to.be.lessThanOrEqual(t1 - t0)
      expect(address1).to.equal(address2)
    })

    it('is immutable', () => {
      const address = Address.fromPublicKey(PrivateKey.fromRandom().toPublicKey())
      expect(Object.isFrozen(address)).to.equal(true)
    })
  })

  describe('from', () => {
    it('from Address instance', () => {
      const address = PrivateKey.fromRandom().toAddress()
      expect(Address.from(address)).to.equal(address)
    })

    it('from bsv.Address', () => {
      const address = PrivateKey.fromRandom().toAddress()
      const bsvAddress = new bsv.Address(address.toString())
      expect(Address.from(bsvAddress).toString()).to.equal(address.toString())
    })

    it('from string', () => {
      const address = PrivateKey.fromRandom().toAddress()
      expect(Address.from(address.toString()).toString()).to.equal(address.toString())
    })

    it('from PublicKey instance', () => {
      const publicKey = PrivateKey.fromRandom().toPublicKey()
      expect(Address.from(publicKey).toString()).to.equal(publicKey.toAddress().toString())
    })

    it('throws if unsupported', () => {
      expect(() => Address.from()).to.throw()
      expect(() => Address.from(null)).to.throw()
      expect(() => Address.from('abc')).to.throw()
    })
  })

  describe('toString', () => {
    it('mainnet', () => {
      const bsvAddress = new bsv.PrivateKey().toAddress()
      expect(Address.fromString(bsvAddress.toString()).toString()).to.equal(bsvAddress.toString())
    })

    it('testnet', () => {
      const bsvAddress = new bsv.PrivateKey(undefined, 'testnet').toAddress()
      expect(Address.fromString(bsvAddress.toString()).toString()).to.equal(bsvAddress.toString())
    })
  })

  describe('toScript', () => {
    it('returns p2pkh lock script', () => {
      const address = PrivateKey.fromRandom().toAddress()
      const script = address.toScript()
      expect(script instanceof Script.templates.P2PKHLockScript).to.equal(true)
      expect(Array.from(script.toBuffer())).to.deep.equal(Array.from(createP2PKHLockScript(address.pubkeyhash)))
    })
  })
})
