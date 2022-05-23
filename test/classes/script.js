const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { Script } = nimble
const bsv = require('bsv')

describe('Script', () => {
  describe('constructor', () => {
    it('create script with buffer property', () => {
      const buffer = [1, 2, 3]
      const script = new Script(buffer)
      expect(script.buffer).to.equal(buffer)
    })

    it('defaults to empty buffer if not passed', () => {
      const script = new Script()
      expect(Array.isArray(script.buffer)).to.equal(true)
      expect(script.buffer.length).to.equal(0)
    })

    it('throws if not a buffer', () => {
      expect(() => new Script(1)).to.throw('not a buffer')
      expect(() => new Script({})).to.throw('not a buffer')
      expect(() => new Script(new Uint16Array())).to.throw('not a buffer')
    })

    it('may be substituted for a buffer', () => {
      const script = new Script([1, 2, 3])
      expect(script.length).to.equal(3)
      expect(script[0]).to.equal(1)
      expect(script[1]).to.equal(2)
      expect(script[2]).to.equal(3)
      const expected = [1, 2, 3]
      for (const byte of script) {
        expect(byte).to.equal(expected.shift())
      }
    })

    it('detects p2pkh lockscript template', () => {
      const address = nimble.PrivateKey.fromRandom().toAddress()
      const script = new Script(nimble.functions.createP2PKHLockScript(address.pubkeyhash))
      expect(script instanceof Script.templates.P2PKHLockScript).to.equal(true)
    })

    it('detects custom script templates', () => {
      class CustomScript extends Script {
        static matches (buffer) { return buffer[0] === 0xab }
      }
      Script.templates.CustomScript = CustomScript
      expect(new Script([0xab]) instanceof CustomScript).to.equal(true)
      expect(new Script([0x00]) instanceof CustomScript).to.equal(false)
      delete Script.templates.CustomScript
    })

    it('create from matching template', () => {
      const address = nimble.PrivateKey.fromRandom().toAddress()
      const buffer = nimble.functions.createP2PKHLockScript(address.pubkeyhash)
      const script = Script.templates.P2PKHLockScript.fromBuffer(buffer)
      expect(script instanceof Script.templates.P2PKHLockScript).to.equal(true)
    })

    it('throws if create from non-matching template', () => {
      expect(() => new Script.templates.P2PKHLockScript([])).to.throw('not a P2PKHLockScript')
    })

    it('throws if template has constructor', () => {
      class CustomScript extends Script {
        constructor (buffer) { super(buffer); this.prefix = buffer[0] }
        static matches (buffer) { return buffer[0] === 0xab }
      }
      Script.templates.CustomScript = CustomScript
      expect(() => new CustomScript([0xab])).to.throw('template constructors not allowed')
      expect(() => new Script([0xab])).to.throw('template constructors not allowed')
      delete Script.templates.CustomScript
    })
  })

  describe('fromString', () => {
    it('decodes hex', () => {
      expect(Array.from(Script.fromString('000102').buffer)).to.deep.equal([0, 1, 2])
    })

    it('decodes asm', () => {

    })

    it('throws if bad', () => {
      expect(() => Script.fromString()).to.throw('not a string')
      expect(() => Script.fromString([])).to.throw('not a string')
      expect(() => Script.fromString('xyz')).to.throw('bad hex char')
      expect(() => Script.fromString('OP_MISSING')).to.throw('bad hex char')
    })
  })

  describe('fromHex', () => {
    it('decodes hex', () => {
      expect(Array.from(Script.fromHex('').buffer)).to.deep.equal([])
      expect(Array.from(Script.fromHex('aabbcc').buffer)).to.deep.equal([0xaa, 0xbb, 0xcc])
    })

    it('throws if bad hex', () => {
      expect(() => Script.fromHex(null)).to.throw('not a string')
      expect(() => Script.fromHex('x')).to.throw('bad hex char')
    })
  })

  describe('fromASM', () => {
    it('decodes asm', () => {
      expect(Array.from(Script.fromASM('OP_TRUE'))).to.deep.equal([81])
    })
  })

  describe('fromBuffer', () => {
    it('creates with buffer', () => {
      expect(Array.from(Script.fromBuffer([]).buffer)).to.deep.equal([])
    })

    it('throws if not a buffer', () => {
      expect(() => Script.fromBuffer()).to.throw('not a buffer')
      expect(() => Script.fromBuffer(null)).to.throw('not a buffer')
      expect(() => Script.fromBuffer({})).to.throw('not a buffer')
    })
  })

  describe('from', () => {
    it('accepts Script instances', () => {
      const script = new Script([1, 2, 3])
      expect(Script.from(script)).to.equal(script)
    })

    it('from bsv.Script', () => {
      const script = new Script([1, 2, 3])
      const bsvScript = new bsv.Script(script.toString())
      expect(Script.from(bsvScript).toString()).to.equal(script.toString())
    })

    it('accepts hex strings', () => {
      expect(Script.from('001122').toString()).to.equal('001122')
    })

    it('accepts asm', () => {
      expect(Script.from('OP_CHECKSIG').toString()).to.equal('ac')
    })

    it('accepts buffers', () => {
      expect(Array.from(Script.from([0, 1, 2]).buffer)).to.deep.equal([0, 1, 2])
    })

    it('throws if none of the above', () => {
      expect(() => Script.from()).to.throw('unsupported type')
      expect(() => Script.from({})).to.throw('bad hex char')
      expect(() => Script.from('xyz')).to.throw('bad hex char')
    })
  })

  describe('toString', () => {
    it('encodes hex', () => {
      expect(Script.fromBuffer([]).toString()).to.equal('')
      expect(Script.fromBuffer([0, 1, 2]).toString()).to.equal('000102')
    })
  })

  describe('toHex', () => {
    it('encodes hex', () => {
      expect(Script.fromBuffer([0xff]).toHex()).to.equal('ff')
    })
  })

  describe('toASM', () => {
    it('encodes asm', () => {
      expect(Script.fromBuffer([0, 81, 100]).toASM()).to.equal('0 OP_1 OP_NOTIF')
    })
  })

  describe('toBuffer', () => {
    it('returns buffer', () => {
      expect(Array.from(Script.fromBuffer([]).toBuffer())).to.deep.equal([])
      expect(Array.from(Script.fromBuffer([0xff]).toBuffer())).to.deep.equal([0xff])
      expect(Array.from(Script.fromBuffer([1, 2, 3]).toBuffer())).to.deep.equal([1, 2, 3])
    })
  })

  describe('length', () => {
    it('returns buffer length', () => {
      expect(new Script().length).to.equal(0)
      expect(new Script([1, 2, 3]).length).to.equal(3)
    })
  })

  describe('slice', () => {
    it('returns slice of buffer', () => {
      expect(Array.from(new Script([1, 2, 3]).slice())).to.deep.equal([1, 2, 3])
      expect(Array.from(new Script([1, 2, 3]).slice(1))).to.deep.equal([2, 3])
      expect(Array.from(new Script([1, 2, 3]).slice(1, 2))).to.deep.equal([2])
    })
  })

  describe('chunks', () => {
    it('returns chunks', () => {
      expect(new Script([100, 255, 1, 2]).chunks).to.deep.equal([{ opcode: 100 }, { opcode: 255 }, { opcode: 1, buf: [2] }])
    })

    it('caches chunks', () => {
      let buffer = []
      for (let i = 0; i < 10000; i++) {
        buffer = buffer.concat([100, 255, 1, 2])
      }
      const script = new Script(buffer)
      const t0 = new Date()
      script.chunks // eslint-disable-line
      const t1 = new Date()
      script.chunks // eslint-disable-line
      const t2 = new Date()
      expect(t2 - t1).to.be.lessThanOrEqual(t1 - t0)
    })
  })

  describe('P2PKHLockScript', () => {
    describe('fromAddress', () => {
      it('creates', () => {
        const address = nimble.PrivateKey.fromRandom().toAddress()
        const script = Script.templates.P2PKHLockScript.fromAddress(address)
        expect(Array.from(script.buffer)).to.deep.equal(Array.from(nimble.functions.createP2PKHLockScript(address.pubkeyhash)))
      })

      it('throws if not an address', () => {
        expect(() => Script.templates.P2PKHLockScript.fromAddress()).to.throw()
        expect(() => Script.templates.P2PKHLockScript.fromAddress('abc')).to.throw()
        expect(() => Script.templates.P2PKHLockScript.fromAddress({})).to.throw()
      })
    })

    describe('toAddress', () => {
      it('returns address for current network', () => {
        const address = nimble.PrivateKey.fromRandom().toAddress()
        const script = Script.templates.P2PKHLockScript.fromAddress(address)
        expect(script.toAddress().toString()).to.equal(address.toString())
      })
    })
  })
})
