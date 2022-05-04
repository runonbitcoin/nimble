const { describe, it } = require('mocha')
const { assert } = require('chai')
require('chai').use(require('chai-as-promised'))
const nimble = require('../env/nimble')

const op = nimble.constants.opcodes
const { evalScript } = nimble.functions

describe('evalScript', () => {
  it('valid script returns vm including stack trace', () => {
    const vm = evalScript([op.OP_2, op.OP_3], [op.OP_ADD, op.OP_5, op.OP_EQUAL])

    assert.isTrue(vm.success)
    assert.isNull(vm.error)
    assert.deepEqual(vm.stack, [[1]])
    assert.lengthOf(vm.stackTrace, 5)
    assert.isTrue(vm.stackTrace.every(l => l.length === 3))
  })

  it('valid script returns vm omitting stack trace', () => {
    const vm = evalScript([op.OP_2, op.OP_3], [op.OP_ADD, op.OP_5, op.OP_EQUAL], undefined, undefined, undefined, { trace: false })

    assert.isTrue(vm.success)
    assert.isNull(vm.error)
    assert.deepEqual(vm.stack, [[1]])
    assert.lengthOf(vm.stackTrace, 0)
  })

  it('invalid script returns vm with error message', () => {
    const vm1 = evalScript([op.OP_2, op.OP_3, op.OP_CHECKSIGVERIFY], [op.OP_ADD, op.OP_5, op.OP_EQUAL])
    assert.isFalse(vm1.success)
    assert.equal(vm1.error.message, 'non-push data in unlock script')

    const vm2 = evalScript([op.OP_2, op.OP_3], [op.OP_ADD, op.OP_6, op.OP_EQUALVERIFY])
    assert.isFalse(vm2.success)
    assert.match(vm2.error.message, /OP_EQUALVERIFY failed/)
  })

  it('valid script returns vm asynchronosly', async () => {
    await evalScript([op.OP_2, op.OP_3], [op.OP_ADD, op.OP_5, op.OP_EQUAL], undefined, undefined, undefined, { async: true })
      .then(vm => assert.isTrue(vm.success))
    assert.isTrue(true)
  })

  it('invalid script returns vm asynchronosly (does not reject)', async () => {
    await evalScript([op.OP_2, op.OP_3, op.OP_CHECKSIGVERIFY], [op.OP_ADD, op.OP_5, op.OP_EQUAL], undefined, undefined, undefined, { async: true })
      .then(vm => assert.isFalse(vm.success))
    assert.isTrue(true)
  })
})
