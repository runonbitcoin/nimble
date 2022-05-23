const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { generatePrivateKey, calculatePublicKey, ecdsaSignWithK, sha256, decodeHex } = nimble.functions
const bsv = require('bsv')

describe('ecdsaSign', () => {
  it('generate signature', () => {
    const data = 'abc'
    const privateKey = generatePrivateKey()
    const publicKey = calculatePublicKey(privateKey)
    const hash = sha256(Buffer.from(data, 'utf8'))
    const k = decodeHex('1111111111111111111111111111111111111111111111111111111111111111')
    const signature = ecdsaSignWithK(hash, k, privateKey, publicKey)

    const hashbuf = bsv.deps.Buffer.from(hash).reverse()
    const endian = 'little'
    const rbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.r))
    const sbn = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(signature.s))
    const bsvSignature = new bsv.crypto.Signature(rbn, sbn)
    const bsvPrivateKey = new bsv.PrivateKey(bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(privateKey)))
    const bsvPublicKey = bsvPrivateKey.toPublicKey()

    const ecdsa = bsv.crypto.ECDSA()
    ecdsa.k = bsv.crypto.BN.fromBuffer(bsv.deps.Buffer.from(k))
    const sig = ecdsa.set({ hashbuf, endian, privkey: bsvPrivateKey }).sign().sig

    expect(Buffer.from(signature.r).toString('hex')).to.equal(new bsv.crypto.BN(bsv.deps.Buffer.from(sig.r.toArray())).toBuffer().toString('hex'))
    expect(Buffer.from(signature.s).toString('hex')).to.equal(new bsv.crypto.BN(bsv.deps.Buffer.from(sig.s.toArray())).toBuffer().toString('hex'))

    const verified = bsv.crypto.ECDSA.verify(hashbuf, bsvSignature, bsvPublicKey, endian)
    expect(verified).to.equal(true)
  })

  it('returns null if k=n', () => {
    const data = 'abc'
    const privateKey = generatePrivateKey()
    const publicKey = calculatePublicKey(privateKey)
    const hash = sha256(Buffer.from(data, 'utf8'))
    const k = decodeHex('FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141')
    const signature = ecdsaSignWithK(hash, k, privateKey, publicKey)
    expect(signature).to.equal(null)
  })
})
