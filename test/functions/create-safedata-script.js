const { describe, it } = require('mocha')
const { expect } = require('chai')
const nimble = require('../env/nimble')
const { createSafeDataScript } = nimble.functions
const bsv = require('bsv')

describe('safe data script', () => {
  it('script with no values', () => {
    const data = []
    const emptyString = ''
    const bsvScript = bsv.Script.buildSafeDataOut(data).toBuffer()
    const bsvScript2 = bsv.Script.buildSafeDataOut(emptyString).toBuffer()
    const nimbleScript = createSafeDataScript(data)
    const nimbleScript2 = createSafeDataScript(emptyString)
    const nimbleScript3 = createSafeDataScript()
    expect(Array.from(bsvScript)).to.deep.equal(Array.from(nimbleScript))
    expect(Array.from(bsvScript2)).to.deep.equal(Array.from(nimbleScript2))
    expect(Array.from(bsvScript)).to.deep.equal(Array.from(nimbleScript3))
  })

  it('script from single pushdata', () => {
    const data = 'Nimble 42'
    const bsvSCript = bsv.Script.buildSafeDataOut(data).toBuffer()
    const nimbleScript = createSafeDataScript(data)
    expect(Array.from(bsvSCript)).to.deep.equal(Array.from(nimbleScript))
  })

  it('script from pushdata array', () => {
    const data = ['Nimble', '42']
    const bsvSCript = bsv.Script.buildSafeDataOut(data).toBuffer()
    const nimbleScript = createSafeDataScript(data)
    expect(Array.from(bsvSCript)).to.deep.equal(Array.from(nimbleScript))
  })

  it('throws if not valid data', () => {
    const data = {}
    expect(() => createSafeDataScript(data)).to.throw('invalid data')
  })
})
