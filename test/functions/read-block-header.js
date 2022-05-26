const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { readBlockHeader, decodeHex, encodeHex, readVarint, readTx } = nimble.functions
const { BufferReader } = nimble.classes

describe('readBlockHeader', () => {
  it('genesis header', () => {
    const genesisBlockHeader = '0100000000000000000000000000000000000000000000000000000000000000000000003BA3EDFD7A7B12B27AC72C3E67768F617FC81BC3888A51323A9FB8AA4B1E5E4A29AB5F49FFFF001D1DAC2B7C'
    expect(decodeHex(genesisBlockHeader).length).to.equal(80)
    const reader = new BufferReader(decodeHex(genesisBlockHeader))
    const header = readBlockHeader(reader)
    reader.close()
    expect(header.version).to.equal(1)
    expect(encodeHex(header.prevBlock)).to.equal('0000000000000000000000000000000000000000000000000000000000000000')
    expect(encodeHex(header.merkleRoot)).to.equal('3ba3edfd7a7b12b27ac72c3e67768f617fc81bc3888a51323a9fb8aa4b1e5e4a')
    expect(header.timestamp).to.equal(1231006505)
    expect(header.bits).to.equal(0x1d00ffff)
    expect(header.nonce).to.equal(2083236893)
  })

  it('genesis block', () => {
    const genesisBlock = '0100000000000000000000000000000000000000000000000000000000000000000000003BA3EDFD7A7B12B27AC72C3E67768F617FC81BC3888A51323A9FB8AA4B1E5E4A29AB5F49FFFF001D1DAC2B7C0101000000010000000000000000000000000000000000000000000000000000000000000000FFFFFFFF4D04FFFF001D0104455468652054696D65732030332F4A616E2F32303039204368616E63656C6C6F72206F6E206272696E6B206F66207365636F6E64206261696C6F757420666F722062616E6B73FFFFFFFF0100F2052A01000000434104678AFDB0FE5548271967F1A67130B7105CD6A828E03909A67962E0EA1F61DEB649F6BC3F4CEF38C4F35504E51EC112DE5C384DF7BA0B8D578A4C702B6BF11D5FAC00000000'
    const reader = new BufferReader(decodeHex(genesisBlock))
    readBlockHeader(reader)
    const txCount = readVarint(reader)
    expect(txCount).to.equal(1)
    const tx = readTx(reader)
    expect(tx.version).to.equal(1)
    const inputScriptAscii = Buffer.from(tx.inputs[0].script).toString()
    expect(inputScriptAscii.includes('The Times 03/Jan/2009 Chancellor on brink of second bailout for banks')).to.equal(true)
    reader.close()
  })

  it('non-genesis block', () => {
    // Block 400000, 000000000000000004ec466ce4732fe6f1ed1cddc2ed4b328fff5224276e3f6f
    const reader = new BufferReader(decodeHex(block))
    const header = readBlockHeader(reader)
    expect(header.timestamp).to.equal(1456417484)
    const txCount = readVarint(reader)
    expect(txCount).to.be.greaterThan(1)
    for (let i = 0; i < txCount; i++) {
      readTx(reader)
    }
    reader.close()
  })

  it('multiple times', () => {
    const genesisBlockHeader = '0100000000000000000000000000000000000000000000000000000000000000000000003BA3EDFD7A7B12B27AC72C3E67768F617FC81BC3888A51323A9FB8AA4B1E5E4A29AB5F49FFFF001D1DAC2B7C'
    const genesisBlockHeader3x = genesisBlockHeader + genesisBlockHeader + genesisBlockHeader
    const reader = new BufferReader(decodeHex(genesisBlockHeader3x))
    const header1 = readBlockHeader(reader)
    const header2 = readBlockHeader(reader)
    const header3 = readBlockHeader(reader)
    reader.close()
    expect(header1).to.deep.equal(header2)
    expect(header2).to.deep.equal(header3)
  })

  it('throws if not enough data', () => {
    const genesisBlockHeader = '0100000000000000000000000000000000000000000000000000000000000000000000003BA3EDFD7A7B12B27AC72C3E67768F617FC81BC3888A51323A9FB8AA4B1E5E4A29AB5F49FFFF001D1DAC2B'
    const reader = new BufferReader(decodeHex(genesisBlockHeader))
    expect(() => readBlockHeader(reader)).to.throw('not enough data')
  })
})