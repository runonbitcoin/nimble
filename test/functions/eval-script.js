const { describe, it } = require('mocha')
const { assert, expect } = require('chai')
require('chai').use(require('chai-as-promised'))
const nimble = require('../env/nimble')
const {
  evalScript,
  decodeHex,
  encodePushData,
  writePushData,
  decodeTx,
  generateTxSignature,
} = nimble.functions
const { BufferWriter } = nimble.classes
const {
  OP_TRUE,
  OP_1,
  OP_2,
  OP_3,
  OP_4,
  OP_5,
  OP_6,
  OP_7,
  OP_8,
  OP_9,
  OP_10,
  OP_11,
  OP_12,
  OP_13,
  OP_14,
  OP_15,
  OP_16,
  OP_PUSHDATA1,
  OP_PUSHDATA2,
  OP_PUSHDATA4,
  OP_2DUP,
  OP_2OVER,
  OP_2ROT,
  OP_0,
  OP_CHECKSIG,
  OP_CHECKSIGVERIFY,
  OP_CHECKMULTISIG,
  OP_CHECKMULTISIGVERIFY,
  OP_MIN,
  OP_MAX,
  OP_1NEGATE,
  OP_NUM2BIN,
  OP_BIN2NUM,
  OP_NUMEQUALVERIFY,
  OP_NUMNOTEQUAL,
  OP_LESSTHAN,
  OP_LESSTHANOREQUAL,
  OP_GREATERTHAN,
  OP_GREATERTHANOREQUAL,
  OP_ADD,
  OP_SUB,
  OP_MUL,
  OP_DIV,
  OP_MOD,
  OP_BOOLAND,
  OP_BOOLOR,
  OP_NUMEQUAL,
  OP_WITHIN,
  OP_CAT,
  OP_SPLIT,
  OP_SIZE,
  OP_AND,
  OP_OR,
  OP_XOR,
  OP_LSHIFT,
  OP_RSHIFT,
  OP_INVERT,
  OP_EQUAL,
  OP_EQUALVERIFY,
  OP_PICK,
  OP_ROLL,
  OP_ROT,
  OP_SWAP,
  OP_TUCK,
  OP_2DROP,
  OP_3DUP,
  OP_2SWAP,
  OP_1ADD,
  OP_1SUB,
  OP_IF,
  OP_ELSE,
  OP_ENDIF,
  OP_VERIFY,
  OP_RETURN,
  OP_FALSE,
  OP_TOALTSTACK,
  OP_FROMALTSTACK,
  OP_SHA256,
  OP_HASH160,
  OP_HASH256,
  OP_NIP,
  OP_NOTIF,
  OP_DROP,
  OP_OVER,
  OP_NEGATE,
  OP_ABS,
  OP_NOT,
  OP_NOP,
  OP_IFDUP,
  OP_DEPTH,
  OP_DUP,
  OP_0NOTEQUAL,
  OP_RIPEMD160,
  OP_SHA1,
  OP_NOP1,
  OP_NOP2,
  OP_NOP3,
  OP_NOP4,
  OP_NOP5,
  OP_NOP6,
  OP_NOP7,
  OP_NOP8,
  OP_NOP9,
  OP_NOP10,
} = nimble.constants.opcodes

describe('evalScript', () => {
  it('valid script returns vm including stack trace', () => {
    const vm = evalScript([OP_2, OP_3], [OP_ADD, OP_5, OP_EQUAL])

    assert.isTrue(vm.success)
    assert.isNull(vm.error)
    assert.deepEqual(vm.stack, [[1]])
    assert.lengthOf(vm.stackTrace, 5)
    assert.isTrue(vm.stackTrace.every((l) => l.length === 3))
  })

  it('valid script returns vm omitting stack trace', () => {
    const vm = evalScript(
      [OP_2, OP_3],
      [OP_ADD, OP_5, OP_EQUAL],
      undefined,
      undefined,
      undefined,
      { trace: false }
    )

    assert.isTrue(vm.success)
    assert.isNull(vm.error)
    assert.deepEqual(vm.stack, [[1]])
    assert.lengthOf(vm.stackTrace, 0)
  })

  it('invalid script returns vm with error message', () => {
    const vm1 = evalScript(
      [OP_2, OP_3, OP_CHECKSIGVERIFY],
      [OP_ADD, OP_5, OP_EQUAL]
    )
    assert.isFalse(vm1.success)
    assert.equal(vm1.error.message, 'non-push data in unlock script')

    const vm2 = evalScript([OP_2, OP_3], [OP_ADD, OP_6, OP_EQUALVERIFY])
    assert.isFalse(vm2.success)
    assert.match(vm2.error.message, /OP_EQUALVERIFY failed/)
  })

  it('valid script returns vm asynchronosly', async () => {
    await evalScript(
      [OP_2, OP_3],
      [OP_ADD, OP_5, OP_EQUAL],
      undefined,
      undefined,
      undefined,
      { async: true }
    ).then((vm) => assert.isTrue(vm.success))
    assert.isTrue(true)
  })

  it('invalid script returns vm asynchronosly (does not reject)', async () => {
    await evalScript(
      [OP_2, OP_3, OP_CHECKSIGVERIFY],
      [OP_ADD, OP_5, OP_EQUAL],
      undefined,
      undefined,
      undefined,
      { async: true }
    ).then((vm) => assert.isFalse(vm.success))
    assert.isTrue(true)
  })

  it('valid script passes', async () => {
    async function pass(script) {
      const vm = evalScript([], script, undefined, undefined, undefined, {
        async: false,
      })
      assert.isTrue(vm.success)
      assert.isNull(vm.error)

      const vm2 = await evalScript(
        [],
        script,
        undefined,
        undefined,
        undefined,
        { async: true }
      )
      assert.isTrue(vm2.success)
      assert.isNull(vm2.error)
    }

    await pass([OP_TRUE])
    await pass([OP_1])
    await pass([OP_2])
    await pass([OP_3])
    await pass([OP_4])
    await pass([OP_5])
    await pass([OP_6])
    await pass([OP_7])
    await pass([OP_8])
    await pass([OP_9])
    await pass([OP_10])
    await pass([OP_11])
    await pass([OP_12])
    await pass([OP_13])
    await pass([OP_14])
    await pass([OP_15])
    await pass([OP_16])
    await pass([1, 1])
    await pass([OP_PUSHDATA1, 2, 0, 1])
    await pass([OP_PUSHDATA2, 2, 0, 0, 1])
    await pass([OP_PUSHDATA4, 2, 0, 0, 0, 0, 1])
    await pass([OP_NOP, OP_NOP, OP_NOP, OP_1])
    await pass([OP_1, OP_1, OP_IF, OP_ELSE, OP_ENDIF])
    await pass([OP_1, OP_1, OP_1, OP_IF, OP_IF, OP_ENDIF, OP_ENDIF])
    await pass([OP_1, OP_IF, OP_1, OP_ELSE, OP_0, OP_ENDIF])
    await pass([OP_0, OP_IF, OP_0, OP_ELSE, OP_1, OP_ENDIF])
    await pass([OP_1, OP_IF, OP_0, OP_1, OP_ENDIF])
    await pass([OP_1, OP_IF, OP_0, OP_IF, OP_ELSE, OP_1, OP_ENDIF, OP_ENDIF])
    await pass([OP_1, OP_IF, OP_PUSHDATA1, 1, 0, OP_1, OP_ENDIF])
    await pass([OP_1, OP_IF, OP_ELSE, OP_ELSE, OP_1, OP_ENDIF])
    await pass([
      OP_1,
      OP_IF,
      OP_ELSE,
      OP_ELSE,
      OP_ELSE,
      OP_ELSE,
      OP_1,
      OP_ENDIF,
    ])
    await pass([OP_1, OP_IF, OP_1, OP_ELSE, OP_1, OP_IF, OP_ENDIF, OP_ENDIF])
    await pass([OP_1, OP_VERIFY, OP_1])
    await pass([OP_1, OP_RETURN])
    await pass([OP_FALSE, OP_TRUE, OP_RETURN])
    await pass([OP_1, OP_0, OP_TOALTSTACK])
    await pass([OP_1, OP_TOALTSTACK, OP_FROMALTSTACK])
    await pass([OP_1, OP_IFDUP, OP_DROP, OP_DROP, OP_1])
    await pass([OP_DEPTH, OP_1])
    await pass([OP_0, OP_DEPTH])
    await pass([OP_1, OP_0, OP_DROP])
    await pass([OP_0, OP_DUP, OP_DROP, OP_DROP, OP_1])
    await pass([OP_1, OP_0, OP_0, OP_NIP, OP_DROP])
    await pass([OP_1, OP_0, OP_OVER])
    await pass([OP_1, OP_0, OP_PICK])
    await pass([OP_1, OP_0, OP_0, OP_0, OP_0, OP_4, OP_PICK])
    await pass([2, 0xff, 0xff, OP_1, OP_1, OP_PICK, 2, 0xff, 0xff, OP_EQUAL])
    await pass([OP_1, OP_0, OP_ROLL])
    await pass([OP_1, OP_0, OP_0, OP_ROLL, OP_DROP])
    await pass([OP_1, OP_0, OP_0, OP_0, OP_0, OP_4, OP_ROLL])
    await pass([OP_1, OP_0, OP_0, OP_ROT])
    await pass([OP_0, OP_1, OP_0, OP_ROT, OP_ROT])
    await pass([OP_0, OP_0, OP_1, OP_ROT, OP_ROT, OP_ROT])
    await pass([OP_1, OP_0, OP_SWAP])
    await pass([OP_0, OP_1, OP_TUCK, OP_DROP, OP_DROP])
    await pass([OP_1, OP_0, OP_0, OP_2DROP])
    await pass([OP_0, OP_1, OP_2DUP])
    await pass([OP_0, OP_1, OP_2DUP, OP_DROP, OP_DROP])
    await pass([OP_0, OP_0, OP_1, OP_3DUP])
    await pass([OP_0, OP_0, OP_1, OP_3DUP, OP_DROP, OP_DROP, OP_DROP])
    await pass([OP_0, OP_1, OP_0, OP_0, OP_2OVER])
    await pass([OP_0, OP_0, OP_0, OP_1, OP_2OVER, OP_DROP, OP_DROP])
    await pass([OP_0, OP_1, OP_0, OP_0, OP_0, OP_0, OP_2ROT])
    await pass([OP_0, OP_0, OP_0, OP_1, OP_0, OP_0, OP_2ROT, OP_2ROT])
    await pass([OP_0, OP_0, OP_0, OP_0, OP_0, OP_1, OP_2ROT, OP_2ROT, OP_2ROT])
    await pass([OP_1, OP_0, OP_0, OP_0, OP_0, OP_0, OP_2ROT, OP_DROP])
    await pass([OP_0, OP_1, OP_0, OP_0, OP_2SWAP])
    await pass([OP_1, OP_0, OP_0, OP_0, OP_2SWAP, OP_DROP])
    await pass([OP_0, OP_0, OP_CAT, OP_0, OP_EQUAL])
    await pass([OP_0, OP_1, OP_CAT, OP_1, OP_EQUAL])
    await pass([OP_1, OP_2, OP_CAT, 2, 1, 2, OP_EQUAL])
    await pass([OP_1, OP_0, OP_0, OP_2, OP_0, OP_CAT, OP_PICK])
    await pass([OP_0, OP_0, OP_CAT, OP_IF, OP_ELSE, OP_1, OP_ENDIF])
    await pass([OP_0, OP_0, OP_SPLIT, OP_0, OP_EQUALVERIFY, OP_0, OP_EQUAL])
    await pass([2, OP_0, OP_1, OP_1, OP_SPLIT])
    await pass([2, OP_0, OP_1, OP_2, OP_SPLIT, OP_DROP])
    await pass([2, OP_0, OP_1, OP_0, OP_SPLIT])
    await pass([OP_0, OP_0, OP_SPLIT, OP_1])
    await pass([OP_1, OP_1, OP_SPLIT, OP_DROP])
    await pass([
      3,
      0x00,
      0x11,
      0x22,
      OP_0,
      OP_SPLIT,
      3,
      0x00,
      0x11,
      0x22,
      OP_EQUALVERIFY,
      OP_0,
      OP_EQUAL,
    ])
    await pass([
      3,
      0x00,
      0x11,
      0x22,
      OP_1,
      OP_SPLIT,
      2,
      0x11,
      0x22,
      OP_EQUALVERIFY,
      1,
      0x00,
      OP_EQUAL,
    ])
    await pass([
      3,
      0x00,
      0x11,
      0x22,
      OP_2,
      OP_SPLIT,
      1,
      0x22,
      OP_EQUALVERIFY,
      2,
      0x00,
      0x11,
      OP_EQUAL,
    ])
    await pass([
      3,
      0x00,
      0x11,
      0x22,
      OP_3,
      OP_SPLIT,
      OP_0,
      OP_EQUALVERIFY,
      3,
      0x00,
      0x11,
      0x22,
      OP_EQUAL,
    ])
    await pass([2, OP_0, OP_1, OP_SIZE, OP_2, OP_EQUALVERIFY])
    await pass([OP_1, OP_SIZE])
    await pass([OP_1, OP_SIZE, OP_DROP])
    await pass([OP_1, OP_1, OP_AND])
    await pass([OP_1, OP_1, OP_OR])
    await pass([OP_1, OP_1, OP_XOR, OP_IF, OP_ELSE, OP_1, OP_ENDIF])
    await pass([3, 0xff, 0x01, 0x00, OP_INVERT, 3, 0x00, 0xfe, 0xff, OP_EQUAL])
    await pass([OP_0, OP_0, OP_LSHIFT, OP_0, OP_EQUAL])
    await pass([OP_4, OP_2, OP_LSHIFT, OP_16, OP_EQUAL])
    await pass([2, 0x12, 0x34, OP_4, OP_LSHIFT, 2, 0x23, 0x40, OP_EQUAL])
    await pass([OP_0, OP_0, OP_RSHIFT, OP_0, OP_EQUAL])
    await pass([OP_4, OP_2, OP_RSHIFT, OP_1, OP_EQUAL])
    await pass([2, 0x12, 0x34, OP_4, OP_RSHIFT, 2, 0x01, 0x23, OP_EQUAL])
    await pass([OP_0, OP_0, OP_EQUAL])
    await pass([OP_1, OP_1, OP_EQUAL])
    await pass([OP_1, OP_0, OP_0, OP_EQUALVERIFY])
    await pass([OP_0, OP_1ADD])
    await pass([OP_1, OP_1ADD, OP_2, OP_EQUAL])
    await pass([OP_2, OP_1SUB])
    await pass([OP_0, OP_1SUB, OP_1NEGATE, OP_EQUAL])
    await pass([4, 0xff, 0xff, 0xff, 0x7f, OP_1ADD, OP_SIZE, OP_5, OP_EQUAL])
    await pass([4, 0xff, 0xff, 0xff, 0xff, OP_1SUB, OP_SIZE, OP_5, OP_EQUAL])
    await pass([OP_1, OP_NEGATE, OP_1NEGATE, OP_EQUAL])
    await pass([OP_1NEGATE, OP_NEGATE, OP_1, OP_EQUAL])
    await pass([OP_1, OP_ABS, OP_1, OP_EQUAL])
    await pass([OP_1NEGATE, OP_ABS, OP_1, OP_EQUAL])
    await pass([OP_0, OP_NOT])
    await pass([OP_1, OP_NOT, OP_0, OP_EQUAL])
    await pass([OP_2, OP_NOT, OP_0, OP_EQUAL])
    await pass([OP_1, OP_NOT, OP_NOT])
    await pass([OP_1, OP_0NOTEQUAL])
    await pass([OP_0, OP_0NOTEQUAL, OP_0, OP_EQUAL])
    await pass([OP_2, OP_0NOTEQUAL])
    await pass([5, 0, 0, 0, 0, 0, OP_1ADD])
    await pass([5, 0, 0, 0, 0, 0, OP_1SUB])
    await pass([5, 0, 0, 0, 0, 0, OP_NEGATE, OP_1])
    await pass([5, 0, 0, 0, 0, 0, OP_ABS, OP_1])
    await pass([5, 0, 0, 0, 0, 0, OP_NOT])
    await pass([5, 0, 0, 0, 0, 0, OP_0NOTEQUAL, OP_1])
    await pass([OP_0, OP_1, OP_ADD])
    await pass([OP_1, OP_0, OP_ADD])
    await pass([OP_1, OP_2, OP_ADD, OP_3, OP_EQUAL])
    await pass([
      4,
      0xff,
      0xff,
      0xff,
      0xff,
      4,
      0xff,
      0xff,
      0xff,
      0xff,
      OP_ADD,
      OP_SIZE,
      OP_5,
      OP_EQUAL,
    ])
    await pass([
      5,
      0xff,
      0xff,
      0xff,
      0xff,
      0xff,
      5,
      0xff,
      0xff,
      0xff,
      0xff,
      0xff,
      OP_ADD,
      OP_SIZE,
      OP_6,
      OP_EQUAL,
    ])
    await pass([
      4,
      0xff,
      0xff,
      0xff,
      0x7f,
      4,
      0xff,
      0xff,
      0xff,
      0xff,
      OP_ADD,
      OP_0,
      OP_EQUAL,
    ])
    await pass([OP_2, OP_1, OP_SUB])
    await pass([OP_1, OP_1, OP_SUB, OP_0, OP_EQUAL])
    await pass([
      4,
      0xff,
      0xff,
      0xff,
      0xff,
      4,
      0xff,
      0xff,
      0xff,
      0x7f,
      OP_SUB,
      OP_SIZE,
      OP_5,
      OP_EQUAL,
    ])
    await pass([
      4,
      0xff,
      0xff,
      0xff,
      0x7f,
      4,
      0xff,
      0xff,
      0xff,
      0x7f,
      OP_SUB,
      OP_0,
      OP_EQUAL,
    ])
    await pass([OP_1, OP_1, OP_MUL, OP_1, OP_EQUAL])
    await pass([OP_2, OP_3, OP_MUL, OP_6, OP_EQUAL])
    await pass([4, 0xff, 0xff, 0xff, 0x7f, 4, 0xff, 0xff, 0xff, 0x7f, OP_MUL])
    await pass([OP_1, OP_1NEGATE, OP_MUL, OP_1NEGATE, OP_EQUAL])
    await pass([OP_1, OP_1, OP_DIV, OP_1, OP_EQUAL])
    await pass([OP_5, OP_2, OP_DIV, OP_2, OP_EQUAL])
    await pass([OP_2, OP_1NEGATE, OP_DIV, 1, 130, OP_EQUAL])
    await pass([OP_1, OP_1, OP_MOD, OP_0, OP_EQUAL])
    await pass([OP_5, OP_2, OP_MOD, OP_1, OP_EQUAL])
    await pass([OP_5, 1, 0x82, OP_MOD, OP_1, OP_EQUAL])
    await pass([1, 0x83, OP_2, OP_MOD, OP_1NEGATE, OP_EQUAL])
    await pass([OP_1, OP_1, OP_BOOLAND])
    await pass([OP_0, OP_1, OP_BOOLAND, OP_0, OP_EQUAL])
    await pass([OP_1, OP_0, OP_BOOLOR])
    await pass([OP_0, OP_0, OP_BOOLOR, OP_0, OP_EQUAL])
    await pass([OP_1, OP_1, OP_NUMEQUAL])
    await pass([OP_0, OP_1, OP_NUMEQUAL, OP_NOT])
    await pass([OP_1, OP_1, OP_NUMEQUALVERIFY, OP_1])
    await pass([OP_1, OP_0, OP_NUMNOTEQUAL])
    await pass([OP_1, OP_1, OP_NUMNOTEQUAL, OP_NOT])
    await pass([OP_0, OP_1, OP_LESSTHAN])
    await pass([OP_1, OP_2, OP_LESSTHAN])
    await pass([OP_1NEGATE, OP_0, OP_LESSTHAN])
    await pass([OP_0, OP_0, OP_LESSTHAN, OP_NOT])
    await pass([OP_1, OP_0, OP_GREATERTHAN])
    await pass([OP_0, OP_1NEGATE, OP_GREATERTHAN])
    await pass([OP_2, OP_1, OP_GREATERTHAN])
    await pass([OP_0, OP_0, OP_GREATERTHAN, OP_NOT])
    await pass([OP_0, OP_1, OP_LESSTHANOREQUAL])
    await pass([OP_1NEGATE, OP_0, OP_LESSTHANOREQUAL])
    await pass([OP_0, OP_0, OP_LESSTHANOREQUAL])
    await pass([OP_1NEGATE, OP_1NEGATE, OP_LESSTHANOREQUAL])
    await pass([OP_1, OP_0, OP_GREATERTHANOREQUAL])
    await pass([OP_0, OP_1NEGATE, OP_GREATERTHANOREQUAL])
    await pass([OP_0, OP_0, OP_GREATERTHANOREQUAL])
    await pass([OP_1, OP_1, OP_GREATERTHANOREQUAL])
    await pass([OP_0, OP_1, OP_MIN, OP_0, OP_EQUAL])
    await pass([OP_0, OP_0, OP_MIN, OP_0, OP_EQUAL])
    await pass([OP_1NEGATE, OP_0, OP_MIN, OP_1NEGATE, OP_EQUAL])
    await pass([OP_0, OP_1, OP_MAX, OP_1, OP_EQUAL])
    await pass([OP_0, OP_0, OP_MAX, OP_0, OP_EQUAL])
    await pass([OP_1NEGATE, OP_0, OP_MAX, OP_0, OP_EQUAL])
    await pass([OP_0, OP_0, OP_1, OP_WITHIN])
    await pass([OP_0, OP_1NEGATE, OP_1, OP_WITHIN])
    await pass([1, 0, OP_BIN2NUM, OP_0, OP_EQUAL])
    await pass([3, 0, 0, 0, OP_BIN2NUM, OP_0, OP_EQUAL])
    await pass([7, 1, 0, 0, 0, 0, 0, 0, OP_BIN2NUM, OP_1, OP_EQUAL])
    await pass([7, 1, 0, 0, 0, 0, 0, 0x80, OP_BIN2NUM, OP_1NEGATE, OP_EQUAL])
    await pass([1, 0x80, OP_BIN2NUM, OP_0, OP_EQUAL])
    await pass([7, 0, 0, 0, 0, 0, 0, 0x80, OP_BIN2NUM, OP_0, OP_EQUAL])
    await pass([7, 1, 2, 3, 0, 0, 0, 0, OP_BIN2NUM, 3, 1, 2, 3, OP_EQUAL])
    await pass([OP_1, OP_7, OP_NUM2BIN, 7, 1, 0, 0, 0, 0, 0, 0, OP_EQUAL])
    await pass([OP_0, OP_4, OP_NUM2BIN, OP_0, OP_NUMEQUAL])
    await pass([OP_0, OP_4, OP_NUM2BIN, OP_0, OP_EQUAL, OP_NOT])
    await pass([OP_1, OP_1, OP_16, OP_NUM2BIN, OP_BIN2NUM, OP_EQUAL])
    await pass([OP_1NEGATE, OP_DUP, OP_16, OP_NUM2BIN, OP_BIN2NUM, OP_EQUAL])
    await pass([OP_1, 5, 129, 0, 0, 0, 0, OP_NUM2BIN])
    await pass([OP_1, OP_RIPEMD160])
    await pass([OP_0, OP_RIPEMD160])
    await pass(
      Array.from(
        encodePushData(decodeHex('cea1b21f1a739fba68d1d4290437d2c5609be1d3'))
      )
        .concat(Array.from(encodePushData(decodeHex('0123456789abcdef'))))
        .concat([OP_RIPEMD160, OP_EQUAL])
    )
    await pass([OP_1, OP_SHA1])
    await pass([OP_0, OP_SHA1])
    await pass(
      Array.from(
        encodePushData(decodeHex('0ca2eadb529ac2e63abf9b4ae3df8ee121f10547'))
      )
        .concat(Array.from(encodePushData(decodeHex('0123456789abcdef'))))
        .concat([OP_SHA1, OP_EQUAL])
    )
    await pass([OP_1, OP_SHA256])
    await pass([OP_0, OP_SHA256])
    await pass(
      Array.from(
        encodePushData(
          decodeHex(
            '55c53f5d490297900cefa825d0c8e8e9532ee8a118abe7d8570762cd38be9818'
          )
        )
      )
        .concat(Array.from(encodePushData(decodeHex('0123456789abcdef'))))
        .concat([OP_SHA256, OP_EQUAL])
    )
    await pass([OP_1, OP_HASH160])
    await pass([OP_0, OP_HASH160])
    await pass(
      Array.from(
        encodePushData(decodeHex('a956ed79819901b1b2c7b3ec045081f749c588ed'))
      )
        .concat(Array.from(encodePushData(decodeHex('0123456789abcdef'))))
        .concat([OP_HASH160, OP_EQUAL])
    )
    await pass([OP_1, OP_HASH256])
    await pass([OP_0, OP_HASH256])
    await pass(
      Array.from(
        encodePushData(
          decodeHex(
            '137ad663f79da06e282ed0abbec4d70523ced5ff8e39d5c2e5641d978c5925aa'
          )
        )
      )
        .concat(Array.from(encodePushData(decodeHex('0123456789abcdef'))))
        .concat([OP_HASH256, OP_EQUAL])
    )
    await pass([
      OP_NOP1,
      OP_NOP2,
      OP_NOP3,
      OP_NOP4,
      OP_NOP5,
      OP_NOP6,
      OP_NOP7,
      OP_NOP8,
      OP_NOP9,
      OP_NOP10,
      OP_1,
    ])
  })

  it('checksig', async () => {
    const rawtx =
      '0100000001b207aba3f19358f3a58048d7647cff2ca25a57fe92a1c4324ba47fdde7d7eca4030000006a4730440220316f5707b0a872c67bebc10f15832389c96a6be58e803c992d6b4b3bc5864687022019cf6ab02706865b8507a4f56eeae155ac794a363d95dce8c8777c10f1f9fc01412103093313584be3ccd8777947c1b8f9cc945e9764296451aa29209f9ac56eb4e91affffffff03204e0000000000001976a91461ed573d90e9582689739e72d17624b2d8faa4c388ac204e0000000000001976a914fca1fe054916c043dc36d703a464cb6edce8e72e88ac5b0c6e01000000001976a91400937c46183f418f8eaac2af10db62c5c852ffe888ac00000000'
    const prevrawtx =
      '01000000014b71d4aa217e6e515f343c1b5f3e6294fd416e8fa782b089a412c6e32ad0ed07050000006a4730440220449b66c7ec56b6e6f4c133e3cce67cb74e97bbc924deb3f4dbf43e3de941d05e0220649510d81de69df1bbef6b627dab88e20fa272a811613f97503c45715146c929412103a8ff752878232a096647f90350851419daca06a498f382de8b89772930ad4727ffffffff0450c30000000000001976a914902bfe624e2620a4615e7bb6511abd2c2fc7ff7d88ac204e0000000000001976a9149e2f22092ab09053c8be4a662045c069205a511588ac10270000000000001976a914eec1eda286b8fd1a198b6f6ee103bd24d3cdbd5188ac37a96e01000000001976a9149595b9d204ca44fde3b4fb43eff8e8b9d74edd8a88ac00000000'
    const vin = 0
    const tx = decodeTx(decodeHex(rawtx))
    const prevtx = decodeTx(decodeHex(prevrawtx))
    const input = tx.inputs[vin]
    const vout = input.vout
    const unlockScript = input.script
    const prevout = prevtx.outputs[vout]
    const lockScript = prevout.script
    const parentSatoshis = prevout.satoshis
    const vm = evalScript(unlockScript, lockScript, tx, vin, parentSatoshis, {
      async: false,
    })
    assert.isTrue(vm.success)
    const tx2 = decodeTx(decodeHex(rawtx))
    const vm2 = await evalScript(
      unlockScript,
      lockScript,
      tx2,
      vin,
      parentSatoshis,
      { async: true }
    )
    assert.isTrue(vm2.success)
  })

  it('checksigverify', async () => {
    const pk = nimble.PrivateKey.fromRandom()

    const lockScriptWriter = new BufferWriter()
    writePushData(lockScriptWriter, pk.toPublicKey().toBuffer())
    lockScriptWriter.write([OP_CHECKSIGVERIFY])
    lockScriptWriter.write([OP_1])
    const lockScript = lockScriptWriter.toBuffer()

    const tx1 = new nimble.Transaction().output({
      script: lockScript,
      satoshis: 1000,
    })

    const tx2 = new nimble.Transaction().from(tx1.outputs[0])

    const signature = generateTxSignature(
      tx2,
      0,
      lockScript,
      1000,
      pk.number,
      pk.toPublicKey().point
    )
    const unlockScript = encodePushData(signature)

    tx2.inputs[0].script = unlockScript

    expect(
      evalScript(unlockScript, lockScript, tx2, 0, 1000, { async: false })
        .success
    ).to.equal(true)
    expect(
      (
        await evalScript(unlockScript, lockScript, tx2, 0, 1000, {
          async: true,
        })
      ).success
    ).to.equal(true)
  })

  it('checkmultisig valid', async () => {
    const pk1 = nimble.PrivateKey.fromRandom()
    const pk2 = nimble.PrivateKey.fromRandom()
    const pk3 = nimble.PrivateKey.fromRandom()

    const lockScriptWriter = new BufferWriter()
    lockScriptWriter.write([OP_2])
    writePushData(lockScriptWriter, pk1.toPublicKey().toBuffer())
    writePushData(lockScriptWriter, pk2.toPublicKey().toBuffer())
    writePushData(lockScriptWriter, pk3.toPublicKey().toBuffer())
    lockScriptWriter.write([OP_3])
    lockScriptWriter.write([OP_CHECKMULTISIG])
    const lockScript = lockScriptWriter.toBuffer()

    const tx1 = new nimble.Transaction().output({
      script: lockScript,
      satoshis: 1000,
    })

    const tx2 = new nimble.Transaction().from(tx1.outputs[0])

    const signature1 = generateTxSignature(
      tx2,
      0,
      lockScript,
      1000,
      pk1.number,
      pk1.toPublicKey().point
    )
    const signature3 = generateTxSignature(
      tx2,
      0,
      lockScript,
      1000,
      pk3.number,
      pk3.toPublicKey().point
    )

    const unlockScriptWriter = new BufferWriter()
    unlockScriptWriter.write([OP_0])
    writePushData(unlockScriptWriter, signature1)
    writePushData(unlockScriptWriter, signature3)
    const unlockScript = unlockScriptWriter.toBuffer()
    tx2.inputs[0].script = unlockScript

    expect(
      evalScript(unlockScript, lockScript, tx2, 0, 1000, { async: false })
        .success
    ).to.equal(true)
    expect(
      (
        await evalScript(unlockScript, lockScript, tx2, 0, 1000, {
          async: true,
        })
      ).success
    ).to.equal(true)
  })

  it('checkmultisig throws if out of order', async () => {
    const pk1 = nimble.PrivateKey.fromRandom()
    const pk2 = nimble.PrivateKey.fromRandom()
    const pk3 = nimble.PrivateKey.fromRandom()

    const lockScriptWriter = new BufferWriter()
    lockScriptWriter.write([OP_2])
    writePushData(lockScriptWriter, pk1.toPublicKey().toBuffer())
    writePushData(lockScriptWriter, pk2.toPublicKey().toBuffer())
    writePushData(lockScriptWriter, pk3.toPublicKey().toBuffer())
    lockScriptWriter.write([OP_3])
    lockScriptWriter.write([OP_CHECKMULTISIG])
    const lockScript = lockScriptWriter.toBuffer()

    const tx1 = new nimble.Transaction().output({
      script: lockScript,
      satoshis: 1000,
    })

    const tx2 = new nimble.Transaction().from(tx1.outputs[0])

    const signature1 = generateTxSignature(
      tx2,
      0,
      lockScript,
      1000,
      pk1.number,
      pk1.toPublicKey().point
    )
    const signature3 = generateTxSignature(
      tx2,
      0,
      lockScript,
      1000,
      pk3.number,
      pk3.toPublicKey().point
    )

    const unlockScriptWriter = new BufferWriter()
    unlockScriptWriter.write([OP_0])
    writePushData(unlockScriptWriter, signature3)
    writePushData(unlockScriptWriter, signature1)
    const unlockScript = unlockScriptWriter.toBuffer()
    tx2.inputs[0].script = unlockScript

    expect(
      evalScript(unlockScript, lockScript, tx2, 0, 1000, { async: false })
        .success
    ).to.equal(false)
    expect(
      (
        await evalScript(unlockScript, lockScript, tx2, 0, 1000, {
          async: true,
        })
      ).success
    ).to.equal(false)
  })

  it('checkmultisigverify throws if repeat signatures', async () => {
    const pk1 = nimble.PrivateKey.fromRandom()
    const pk2 = nimble.PrivateKey.fromRandom()
    const pk3 = nimble.PrivateKey.fromRandom()

    const lockScriptWriter = new BufferWriter()
    lockScriptWriter.write([OP_2])
    writePushData(lockScriptWriter, pk1.toPublicKey().toBuffer())
    writePushData(lockScriptWriter, pk2.toPublicKey().toBuffer())
    writePushData(lockScriptWriter, pk3.toPublicKey().toBuffer())
    lockScriptWriter.write([OP_3])
    lockScriptWriter.write([OP_CHECKMULTISIGVERIFY])
    const lockScript = lockScriptWriter.toBuffer()

    const tx1 = new nimble.Transaction().output({
      script: lockScript,
      satoshis: 1000,
    })

    const tx2 = new nimble.Transaction().from(tx1.outputs[0])

    const signature1 = generateTxSignature(
      tx2,
      0,
      lockScript,
      1000,
      pk1.number,
      pk1.toPublicKey().point
    )

    const unlockScriptWriter = new BufferWriter()
    unlockScriptWriter.write([OP_0])
    writePushData(unlockScriptWriter, signature1)
    writePushData(unlockScriptWriter, signature1)
    const unlockScript = unlockScriptWriter.toBuffer()
    tx2.inputs[0].script = unlockScript

    expect(
      evalScript(unlockScript, lockScript, tx2, 0, 1000, { async: false })
        .success
    ).to.equal(false)
    expect(
      (
        await evalScript(unlockScript, lockScript, tx2, 0, 1000, {
          async: true,
        })
      ).success
    ).to.equal(false)
  })

  it('bad', async () => {
    async function fail(script) {
      expect(
        evalScript([], script, undefined, undefined, undefined, {
          async: false,
        }).success
      ).to.equal(false)
      expect(
        (
          await evalScript([], script, undefined, undefined, undefined, {
            async: true,
          })
        ).success
      ).to.equal(false)
    }

    await fail([])
    await fail([OP_FALSE])
    await fail([1])
    await fail([3, 0, 1])
    await fail([OP_PUSHDATA1, 0])
    await fail([OP_PUSHDATA1, 1])
    await fail([OP_PUSHDATA1, 10, 0])
    await fail([OP_PUSHDATA2, 20, 0])
    await fail([OP_PUSHDATA4, 30, 0])
    await fail([OP_IF, OP_ENDIF])
    await fail([OP_1, OP_1, OP_IF])
    await fail([OP_1, OP_1, OP_NOTIF])
    await fail([OP_1, OP_ELSE])
    await fail([OP_1, OP_ENDIF])
    await fail([OP_1, OP_1, OP_IF, OP_ELSE])
    await fail([OP_1, OP_1, OP_IF, OP_IF, OP_ENDIF])
    await fail([OP_0, OP_IF, OP_1, OP_ELSE, OP_0, OP_ENDIF])
    await fail([OP_0, OP_IF, OP_PUSHDATA1, 1, 1, OP_1, OP_ENDIF])
    await fail([OP_VERIFY])
    await fail([OP_0, OP_VERIFY])
    await fail([OP_RETURN])
    await fail([OP_FALSE, OP_RETURN])
    await fail([OP_TOALTSTACK, OP_1])
    await fail([OP_FROMALTSTACK, OP_1])
    await fail([OP_0, OP_TOALTSTACK, OP_1, OP_FROMALTSTACK])
    await fail([OP_IFDUP])
    await fail([OP_DROP])
    await fail([OP_1, OP_DROP, OP_DROP])
    await fail([OP_DUP])
    await fail([OP_NIP])
    await fail([OP_1, OP_NIP])
    await fail([OP_OVER])
    await fail([OP_1, OP_OVER])
    await fail([OP_PICK])
    await fail([OP_0, OP_PICK])
    await fail([OP_0, OP_1, OP_PICK])
    await fail([OP_ROLL])
    await fail([OP_0, OP_ROLL])
    await fail([OP_0, OP_1, OP_ROLL])
    await fail([OP_ROT])
    await fail([OP_1, OP_ROT])
    await fail([OP_1, OP_1, OP_ROT])
    await fail([OP_0, OP_1, OP_1, OP_ROT])
    await fail([OP_SWAP])
    await fail([OP_1, OP_SWAP])
    await fail([OP_0, OP_1, OP_SWAP])
    await fail([OP_TUCK])
    await fail([OP_1, OP_TUCK])
    await fail([OP_1, OP_0, OP_TUCK])
    await fail([OP_2DROP])
    await fail([OP_1, OP_2DROP])
    await fail([OP_1, OP_1, OP_2DROP])
    await fail([OP_2DUP])
    await fail([OP_1, OP_2DUP])
    await fail([OP_1, OP_0, OP_2DUP])
    await fail([OP_3DUP])
    await fail([OP_1, OP_3DUP])
    await fail([OP_1, OP_1, OP_3DUP])
    await fail([OP_1, OP_1, OP_0, OP_3DUP])
    await fail([OP_2OVER])
    await fail([OP_1, OP_2OVER])
    await fail([OP_1, OP_1, OP_2OVER])
    await fail([OP_1, OP_1, OP_1, OP_2OVER])
    await fail([OP_1, OP_0, OP_1, OP_1, OP_2OVER])
    await fail([OP_2ROT])
    await fail([OP_1, OP_2ROT])
    await fail([OP_1, OP_1, OP_2ROT])
    await fail([OP_1, OP_1, OP_1, OP_2ROT])
    await fail([OP_1, OP_1, OP_1, OP_1, OP_2ROT])
    await fail([OP_1, OP_1, OP_1, OP_1, OP_1, OP_2ROT])
    await fail([OP_1, OP_0, OP_1, OP_1, OP_1, OP_1, OP_2ROT])
    await fail([OP_2SWAP])
    await fail([OP_1, OP_2SWAP])
    await fail([OP_1, OP_1, OP_2SWAP])
    await fail([OP_1, OP_1, OP_1, OP_2SWAP])
    await fail([OP_1, OP_0, OP_1, OP_1, OP_2SWAP])
    await fail([OP_CAT])
    await fail([OP_1, OP_CAT])
    await fail([OP_1, OP_0, OP_0, OP_CAT])
    await fail([OP_SPLIT])
    await fail([OP_1, OP_SPLIT])
    await fail([OP_0, OP_1, OP_SPLIT])
    await fail([OP_1, OP_2, OP_SPLIT])
    await fail([OP_1, OP_1NEGATE, OP_SPLIT])
    await fail([OP_0, OP_SIZE])
    await fail([OP_AND])
    await fail([OP_0, OP_AND])
    await fail([OP_0, OP_1, OP_AND])
    await fail([OP_OR])
    await fail([OP_0, OP_OR])
    await fail([OP_0, OP_1, OP_OR])
    await fail([OP_XOR])
    await fail([OP_0, OP_XOR])
    await fail([OP_0, OP_1, OP_XOR])
    await fail([OP_LSHIFT])
    await fail([OP_1, OP_LSHIFT])
    await fail([OP_1, OP_1NEGATE, OP_LSHIFT])
    await fail([OP_RSHIFT])
    await fail([OP_1, OP_RSHIFT])
    await fail([OP_1, OP_1NEGATE, OP_RSHIFT])
    await fail([OP_INVERT])
    await fail([OP_EQUAL])
    await fail([OP_0, OP_EQUAL])
    await fail([OP_1, OP_0, OP_EQUAL])
    await fail([OP_1, OP_0, OP_EQUALVERIFY, OP_1])
    await fail([OP_1ADD])
    await fail([OP_1SUB])
    await fail([OP_NEGATE])
    await fail([OP_ABS])
    await fail([OP_NOT])
    await fail([OP_0NOTEQUAL])
    await fail([OP_ADD])
    await fail([OP_1, OP_ADD])
    await fail([5, 0, 0, 0, 0, 0, OP_ADD])
    await fail([OP_SUB])
    await fail([OP_1, OP_SUB])
    await fail([5, 0, 0, 0, 0, 0, OP_SUB])
    await fail([OP_MUL])
    await fail([OP_1, OP_MUL])
    await fail([5, 0, 0, 0, 0, 0, OP_MUL])
    await fail([2, 0, 0, 2, 0, 0, OP_MUL])
    await fail([OP_DIV])
    await fail([OP_1, OP_DIV])
    await fail([5, 0, 0, 0, 0, 0, OP_DIV])
    await fail([OP_1, OP_0, OP_DIV])
    await fail([OP_MOD])
    await fail([OP_1, OP_MOD])
    await fail([5, 0, 0, 0, 0, 0, OP_MOD])
    await fail([OP_1, OP_0, OP_MOD])
    await fail([OP_BOOLAND])
    await fail([OP_1, OP_BOOLAND])
    await fail([5, 0, 0, 0, 0, 0, OP_BOOLAND])
    await fail([OP_BOOLOR])
    await fail([OP_1, OP_BOOLOR])
    await fail([5, 0, 0, 0, 0, 0, OP_BOOLOR])
    await fail([OP_NUMEQUAL])
    await fail([OP_1, OP_NUMEQUAL])
    await fail([5, 0, 0, 0, 0, 0, OP_NUMEQUAL])
    await fail([OP_0, OP_1, OP_NUMEQUAL])
    await fail([OP_NUMEQUALVERIFY])
    await fail([OP_1, OP_NUMEQUALVERIFY])
    await fail([5, 0, 0, 0, 0, 0, OP_NUMEQUALVERIFY])
    await fail([OP_1, OP_2, OP_NUMEQUALVERIFY])
    await fail([OP_NUMNOTEQUAL])
    await fail([OP_1, OP_NUMNOTEQUAL])
    await fail([5, 0, 0, 0, 0, 0, OP_NUMNOTEQUAL])
    await fail([OP_1, OP_1, OP_NUMNOTEQUAL])
    await fail([OP_LESSTHAN])
    await fail([OP_1, OP_LESSTHAN])
    await fail([5, 0, 0, 0, 0, 0, OP_LESSTHAN])
    await fail([OP_1, OP_0, OP_LESSTHAN])
    await fail([OP_0, OP_1NEGATE, OP_LESSTHAN])
    await fail([OP_GREATERTHAN])
    await fail([OP_1, OP_GREATERTHAN])
    await fail([5, 0, 0, 0, 0, 0, OP_GREATERTHAN])
    await fail([OP_0, OP_1, OP_GREATERTHAN])
    await fail([OP_1NEGATE, OP_0, OP_GREATERTHAN])
    await fail([OP_LESSTHANOREQUAL])
    await fail([OP_1, OP_LESSTHANOREQUAL])
    await fail([5, 0, 0, 0, 0, 0, OP_LESSTHANOREQUAL])
    await fail([OP_1, OP_0, OP_LESSTHANOREQUAL])
    await fail([OP_0, OP_1NEGATE, OP_LESSTHANOREQUAL])
    await fail([OP_GREATERTHANOREQUAL])
    await fail([OP_1, OP_GREATERTHANOREQUAL])
    await fail([5, 0, 0, 0, 0, 0, OP_GREATERTHANOREQUAL])
    await fail([OP_0, OP_1, OP_GREATERTHANOREQUAL])
    await fail([OP_1NEGATE, OP_0, OP_GREATERTHANOREQUAL])
    await fail([OP_MIN])
    await fail([OP_1, OP_MIN])
    await fail([5, 0, 0, 0, 0, 0, OP_MIN])
    await fail([OP_MAX])
    await fail([OP_1, OP_MAX])
    await fail([5, 0, 0, 0, 0, 0, OP_MAX])
    await fail([OP_WITHIN])
    await fail([OP_1, OP_WITHIN])
    await fail([OP_1, OP_1, OP_WITHIN])
    await fail([5, 0, 0, 0, 0, 0, OP_WITHIN])
    await fail([OP_0, OP_1, OP_2, OP_WITHIN])
    await fail([OP_0, OP_1NEGATE, OP_0, OP_WITHIN])
    await fail([OP_BIN2NUM])
    await fail([OP_NUM2BIN])
    await fail([OP_1, OP_NUM2BIN])
    await fail([OP_1, OP_0, OP_NUM2BIN])
    await fail([OP_1, OP_1NEGATE, OP_NUM2BIN])
    await fail([5, 129, 0, 0, 0, 0, OP_1, OP_NUM2BIN])
    await fail([OP_RIPEMD160])
    await fail([OP_SHA1])
    await fail([OP_SHA256])
    await fail([OP_HASH160])
    await fail([OP_HASH256])
    await fail([OP_CHECKSIG])
    await fail([OP_1, OP_CHECKSIG])
    await fail([OP_CHECKSIGVERIFY])
    await fail([OP_1, OP_CHECKSIGVERIFY])
    await fail([OP_CHECKMULTISIG])
    await fail([OP_1, OP_CHECKMULTISIG])
    await fail([OP_0, OP_0, OP_CHECKMULTISIG])
    await fail([OP_0, OP_0, OP_1NEGATE, OP_CHECKMULTISIG])
    await fail([OP_0, OP_1NEGATE, OP_0, OP_CHECKMULTISIG])
    await fail([OP_0, OP_0, OP_1, OP_CHECKMULTISIG])
    await fail([OP_0, OP_0, 1, 21, OP_CHECKMULTISIG])
    await fail([OP_0, OP_9, OP_9, OP_2, OP_9, OP_1, OP_CHECKMULTISIG])
    await fail([OP_NOP10 + 1])
    await fail([255])
  })

  it('op_push_tx', async () => {
    // 6b48a034eebf2dcca5c0c61dbb8407a4d3dc747786563fb7f46bae677a941778
    const hex =
      '0100000002cad657c4a178b0a4f9fdc546d1947e3c19cea71a8f888c3c9a96778eda45782203000000fdb4034daf030100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000cad657c4a178b0a4f9fdc546d1947e3c19cea71a8f888c3c9a96778eda45782203000000fd100320aaf460daab8997860a390bb3eb641734462c2fd9f86320a6390895a3a94a71c701c35279630142517a75547901687f7501447f77007901207f7504000000007e517951797e56797eaa577901247f75547f77876975756754795579827758947f75557982770128947f77527987696861547921cdb285cc49e5ff3eed6536e7b426e8a528b05bf9276bd05431a671743e651ceb002102dca1e194dd541a47f4c85fea6a4d45bb50f16ed2fddc391bf80b525454f8b40920f941a26b1c1802eaa09109701e4e632e1ef730b0b68c9517e7c19be2ba4c7d37202f282d163597a82d72c263b004695297aecb4d758dccd1dbf61e82a3360bde2c202cde0b36a3821ef6dbd1cc8d754dcbae97526904b063c2722da89735162d282f56795679aa616100790079517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01007e81517a756157795679567956795679537956795479577995939521414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff0061517951795179517997527a75517a5179009f635179517993527a75517a685179517a75517a7561527a75517a517951795296a0630079527994527a75517a68537982775279827754527993517993013051797e527e53797e57797e527e52797e5579517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7e56797e0079517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a756100795779ac517a75517a75517a75517a75517a75517a75517a75517a75517a756177777777778705000000000000ffffffffaaf460daab8997860a390bb3eb641734462c2fd9f86320a6390895a3a94a71c700000000c30000000000ffffffffcad657c4a178b0a4f9fdc546d1947e3c19cea71a8f888c3c9a96778eda457822040000006a473044022049624f444425d53d9465088fe5239ac0e3f36a68c51ea0faeded2accc5f67464022037f203a2ae519af1deb5bad9a2eaada5878157f589a166188bbe505feb8d5c664121026e5da8a96d09642bec2f378d6e91798b41f140f0353fc468c8b8e52e0ccd81b0ffffffff04d0070000000000001976a914d5db232b2065054f58c6fee1a60298ad621d28dc88ac0000000000000000fdc901006a0372756e0105004dbd017b22696e223a312c22726566223a5b22326534376165323832656135366465306234613161386132623439643330623364663863366636386230656662323036313363343331363761616562306635305f6f31222c22373261363165623939306666646236623338653566393535653139346665643566663662303134663735616336383233353339636535363133616561306265385f6f31225d2c226f7574223a5b2237336432353434666465396338343230316630653766376330373232366464316439343262343665626562633732653662633863323032316633353564646161225d2c2264656c223a5b2261373234623162663762623065643235313431313933326233666333396631653237373262326538306239383931383762653739663930373935326636383032225d2c22637265223a5b223137643952503733467579503565443154756e7a7952777652465a63644431366233225d2c2265786563223a5b7b226f70223a2243414c4c222c2264617461223a5b7b22246a6967223a307d2c2273656e64222c5b223137643952503733467579503565443154756e7a7952777652465a63644431366233222c323030305d5d7d5d7d11010000000000001976a91448a6c21f7b62fb917ee09ee18537a878605921f388acb1b40b00000000001976a914d5db232b2065054f58c6fee1a60298ad621d28dc88ac00000000'

    // 227845da8e77969a3c8c888f1aa7ce193c7e94d146c5fdf9a4b078a1c457d6ca
    const prevhex =
      '010000000364974feb567ba63fcfaf27e864b487fef7bd53a452c1312a34f78551beb17227020000006a47304402201dc7ba571d4c668303fc67ebcda250291e3dc589f9e9a26da82c39cdb1e7c7390220434fc4273a3028a5a6f6f266d875a7a1a154c90a315949cad46caa2096d2d6bb412102e0163c5d3a7320384bd4b47a9a33f9f52bfc975ae625e16bcced732d89e5d48affffffff64974feb567ba63fcfaf27e864b487fef7bd53a452c1312a34f78551beb17227000000006a47304402203d038ce0fde27bab0d31e596bf8e98a70c0a57714b7e54fba87d65ebea13b358022008d1583a727300383d03d6b5c222563815ef624171062affece7bbd30eab1d1a4121026e5da8a96d09642bec2f378d6e91798b41f140f0353fc468c8b8e52e0ccd81b0ffffffff64974feb567ba63fcfaf27e864b487fef7bd53a452c1312a34f78551beb17227040000006b483045022100bb2e7ee1e6c2ac89520688693cbf70c814c9ebd47e511d1f1248856926e37593022010b7c2af433ff0e3dfb2ded1300939f9c70677529bfd5f1952eb5957c4edbe7a4121026e5da8a96d09642bec2f378d6e91798b41f140f0353fc468c8b8e52e0ccd81b0ffffffff0522020000000000001976a914d5db232b2065054f58c6fee1a60298ad621d28dc88ac0000000000000000fd9003006a0372756e0105004d84037b22696e223a312c22726566223a5b22643631373030323561363232343864386466366463313465333830366536386238646633643830346338303063376266623233623062343233323836323530355f6f31222c22326534376165323832656135366465306234613161386132623439643330623364663863366636386230656662323036313363343331363761616562306635305f6f31222c22373261363165623939306666646236623338653566393535653139346665643566663662303134663735616336383233353339636535363133616561306265385f6f31222c22373237653762343233623765653430633062356265383766626137666135363733656132643230613734323539303430613732393564396333326139303031315f6f31222c22383162636566323962306534656437343566333432326330623736346133336337366430333638616632643265376464313339646238653030656533643861365f6f31222c22343931343536393336373661663735363765626532303637316335636230313336396163373838633230663362316338303466363234613165646131386633665f6f31222c22336237656634313131383562626533643031636165616462653666313135623031303361353436633465663061633734373461613666626237316166663230385f6f31225d2c226f7574223a5b2231613731363232383763653036336562356533333737306431373564313637643539323638633766336563393261643366643066316430346161626565303234222c2265653738633230356636313132353936656439623563336663393766353739313734653863303539633431353731653132636639336535336637366532613030225d2c2264656c223a5b5d2c22637265223a5b7b2224617262223a7b2261646472657373223a22314c566d536e76536561386166445150414251567a6e664470775a7245616e736e7a222c227361746f73686973223a323030307d2c2254223a7b22246a6967223a317d7d5d2c2265786563223a5b7b226f70223a2243414c4c222c2264617461223a5b7b22246a6967223a307d2c2273656e64222c5b7b2224617262223a7b2261646472657373223a22314c566d536e76536561386166445150414251567a6e664470775a7245616e736e7a222c227361746f73686973223a323030307d2c2254223a7b22246a6967223a317d7d2c323030305d5d7d5d7d11010000000000001976a9147d84ef033a83de99f901583153832ac11819c73d88ac8705000000000000fd100320aaf460daab8997860a390bb3eb641734462c2fd9f86320a6390895a3a94a71c701c35279630142517a75547901687f7501447f77007901207f7504000000007e517951797e56797eaa577901247f75547f77876975756754795579827758947f75557982770128947f77527987696861547921cdb285cc49e5ff3eed6536e7b426e8a528b05bf9276bd05431a671743e651ceb002102dca1e194dd541a47f4c85fea6a4d45bb50f16ed2fddc391bf80b525454f8b40920f941a26b1c1802eaa09109701e4e632e1ef730b0b68c9517e7c19be2ba4c7d37202f282d163597a82d72c263b004695297aecb4d758dccd1dbf61e82a3360bde2c202cde0b36a3821ef6dbd1cc8d754dcbae97526904b063c2722da89735162d282f56795679aa616100790079517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e01007e81517a756157795679567956795679537956795479577995939521414136d08c5ed2bf3ba048afe6dcaebafeffffffffffffffffffffffffffffff0061517951795179517997527a75517a5179009f635179517993527a75517a685179517a75517a7561527a75517a517951795296a0630079527994527a75517a68537982775279827754527993517993013051797e527e53797e57797e527e52797e5579517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f517f7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7c7e7e56797e0079517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a75517a756100795779ac517a75517a75517a75517a75517a75517a75517a75517a75517a7561777777777787ba0b00000000001976a914d5db232b2065054f58c6fee1a60298ad621d28dc88ac00000000'

    const tx = nimble.Transaction.fromString(hex)
    const prevtx = nimble.Transaction.fromString(prevhex)

    const vin = 0
    const vout = tx.inputs[vin].vout
    const prevout = prevtx.outputs[vout]

    expect(
      evalScript(
        tx.inputs[vin].script,
        prevout.script,
        tx,
        vin,
        prevout.satoshis
      ).success
    ).to.equal(true)
    expect(
      (
        await evalScript(
          tx.inputs[vin].script,
          prevout.script,
          tx,
          vin,
          prevout.satoshis
        )
      ).success
    ).to.equal(true)
  })

  it('acceps unlock with pushdata script', async () => {
    const unlock = [OP_1, OP_2]
    const lock = [OP_ADD, OP_3, OP_EQUAL]
    expect(
      evalScript(unlock, lock, undefined, undefined, undefined, {
        async: false,
      }).success
    ).to.equal(true)
    expect(
      (
        await evalScript(unlock, lock, undefined, undefined, undefined, {
          async: true,
        })
      ).success
    ).to.equal(true)
  })

  it('rejects unlock with non-pushdata script', async () => {
    const unlock = [OP_1, OP_2, OP_ADD]
    const lock = [OP_3, OP_EQUAL]
    expect(
      evalScript(unlock, lock, undefined, undefined, undefined, {
        async: false,
      }).success
    ).to.equal(false)
    expect(
      (
        await evalScript(unlock, lock, undefined, undefined, undefined, {
          async: true,
        })
      ).success
    ).to.equal(false)
  })
})

describe('evalScript stackTrace', () => {
  it('correctly traces stack through if/else branches', () => {
    const vm = evalScript(
      [OP_1],
      [OP_IF, OP_1, OP_1, OP_ELSE, OP_2, OP_2, OP_ENDIF, OP_ADD]
    )
    assert.equal(vm.chunks.length, vm.stackTrace.length)
    assert.deepEqual(vm.stack, [[2]])
  })

  it('correctly traces stack through negative if/else branches', () => {
    const vm = evalScript(
      [OP_0],
      [OP_IF, OP_1, OP_1, OP_ELSE, OP_2, OP_2, OP_ENDIF, OP_ADD]
    )
    assert.equal(vm.chunks.length, vm.stackTrace.length)
    assert.deepEqual(vm.stack, [[4]])
  })

  it('correctly traces stack through nested if/else branches', () => {
    const vm = evalScript(
      [OP_1],
      [
        OP_IF,
        OP_1,
        OP_1,
        OP_IF,
        OP_2,
        OP_ELSE,
        OP_3,
        OP_ENDIF,
        OP_ELSE,
        OP_2,
        OP_2,
        OP_ENDIF,
        OP_ADD,
      ]
    )
    assert.equal(vm.chunks.length, vm.stackTrace.length)
    assert.deepEqual(vm.stack, [[3]])
  })

  it('does not trace after OP_RETURN', () => {
    const vm = evalScript(
      [OP_1],
      [OP_2, OP_RETURN, OP_10, { buf: [1, 2, 3, 4] }]
    )
    assert.equal(vm.chunks.length, 5)
    assert.equal(vm.stackTrace.length, 3)
    assert.deepEqual(vm.stack, [[1], [2]])
  })

  it('does not trace after eval error', () => {
    const vm = evalScript(
      [OP_1],
      [OP_FALSE, OP_VERIFY, OP_10, { buf: [1, 2, 3, 4] }]
    )
    assert.equal(vm.chunks.length, 5)
    assert.equal(vm.stackTrace.length, 3)
    assert.deepEqual(vm.stack, [[1]])
  })

  it('does not trace after setup error', () => {
    const vm = evalScript(
      [{ buf: [1, 2, 3, 4] }, OP_BIN2NUM],
      [OP_1, OP_FALSE, OP_VERIFY, OP_10]
    )
    assert.equal(vm.chunks.length, 0)
    assert.equal(vm.stackTrace.length, 0)
    assert.deepEqual(vm.stack, [])
  })
})
