import { expectType } from 'tsd'
import nimble, {
  Address,
  BufferReader,
  ByteArray,
  classes,
  P2PKHLockScript,
  PrivateKey,
  PublicKey,
  Script, 
  Signature, 
  Transaction
} from '../index'

expectType<string>(nimble.version)
expectType<boolean>(nimble.testnet)
expectType<number>(nimble.feePerKb)

// Buffer reader & writer
const buffer = new Uint8Array([1,2,3,4]);
expectType<BufferReader>(new nimble.classes.BufferReader(buffer))
expectType<BufferReader>(new nimble.classes.BufferReader(buffer, 0))

const bufferReader = new nimble.classes.BufferReader(buffer)
expectType<ByteArray>(bufferReader.read(0))
expectType<void>(bufferReader.close())
expectType<void>(bufferReader.checkRemaining(0))

const bufferWriter = new nimble.classes.BufferWriter()
expectType<classes.BufferWriter>(new nimble.classes.BufferWriter())
expectType<classes.BufferWriter>(bufferWriter.write(buffer))
expectType<classes.BufferWriter>(bufferWriter.write([0, 106]))
expectType<ByteArray>(bufferWriter.toBuffer())

// PrivateKey
expectType<PrivateKey>(new nimble.PrivateKey(buffer, false, false))
expectType<PrivateKey>(new nimble.PrivateKey(buffer, false, false, false))
expectType<PrivateKey>(nimble.PrivateKey.fromRandom())

const object = new Object
const privkey = nimble.PrivateKey.fromRandom()
expectType<PrivateKey>(nimble.PrivateKey.fromString(privkey.toString()))
expectType<PrivateKey>(nimble.PrivateKey.from(privkey))
expectType<PrivateKey>(nimble.PrivateKey.from(privkey.toString()))
expectType<PrivateKey>(nimble.PrivateKey.from(object))

expectType<boolean>(privkey.compressed)
expectType<boolean>(privkey.testnet)
expectType<ByteArray>(privkey.number)

expectType<Address>(privkey.toAddress())
expectType<string>(privkey.toString())
expectType<PublicKey>(privkey.toPublicKey())

// PublicKey
const point: nimble.Point = { x: buffer, y: buffer}
expectType<PublicKey>(new nimble.PublicKey(point, false, false))
expectType<PublicKey>(new nimble.PublicKey(point, false, false, false))

const pubkey = nimble.PublicKey.fromPrivateKey(privkey)
expectType<PublicKey>(nimble.PublicKey.fromPrivateKey(privkey))
expectType<PublicKey>(nimble.PublicKey.fromString(pubkey.toString()))
expectType<PublicKey>(nimble.PublicKey.from(privkey))
expectType<PublicKey>(nimble.PublicKey.from(pubkey))
expectType<PublicKey>(nimble.PublicKey.from(pubkey.toString()))
expectType<PublicKey>(nimble.PublicKey.from(object))

expectType<boolean>(pubkey.compressed)
expectType<boolean>(pubkey.testnet)
expectType<nimble.Point>(pubkey.point)

expectType<Address>(pubkey.toAddress())
expectType<string>(pubkey.toString())
expectType<ByteArray>(pubkey.toBuffer())

// Address
expectType<Address>(new nimble.Address(buffer, false))
expectType<Address>(new nimble.Address(buffer, false, false))

expectType<Address>(nimble.Address.fromPublicKey(pubkey))
expectType<Address>(nimble.Address.fromString(pubkey.toAddress.toString()))
expectType<Address>(nimble.Address.from(pubkey))
expectType<Address>(nimble.Address.from(pubkey.toAddress()))
expectType<Address>(nimble.Address.from(pubkey.toAddress().toString()))
expectType<Address>(nimble.Address.from(object))

const address = pubkey.toAddress()
expectType<ByteArray>(address.pubkeyhash)
expectType<boolean>(address.testnet)

expectType<string>(address.toString())
expectType<P2PKHLockScript>(address.toScript())

// Script
expectType<Script>(new nimble.Script())
expectType<Script>(new nimble.Script(buffer))
expectType<Script>(new nimble.Script(buffer, false))

const script = new Script()
expectType<Script>(nimble.Script.fromString(script.toString()))
expectType<Script>(nimble.Script.fromASM(script.toASM()))
expectType<Script>(nimble.Script.fromBuffer(script.toBuffer()))
expectType<Script>(nimble.Script.fromHex(script.toHex()))
expectType<Script>(nimble.Script.from(script))
expectType<Script>(nimble.Script.from(script.toBuffer()))
expectType<Script>(nimble.Script.from(script.toString()))
expectType<Script>(nimble.Script.from(object))

expectType<ByteArray>(script.buffer)
expectType<number>(script.length)
expectType<nimble.Chunk[]>(script.chunks)

expectType<string>(script.toASM())
expectType<ByteArray>(script.toBuffer())
expectType<string>(script.toHex())
expectType<string>(script.toString())

// P2PKHLockScript
const p2pkhLockScript = address.toScript()
expectType<Address>(p2pkhLockScript.toAddress())
expectType<P2PKHLockScript>(nimble.Script.templates.P2PKHLockScript)
expectType<boolean>(nimble.Script.templates.P2PKHLockScript.matches(buffer))
expectType<P2PKHLockScript>(nimble.Script.templates.P2PKHLockScript.fromAddress(address))
expectType<P2PKHLockScript>(nimble.Script.templates.P2PKHLockScript.fromAddress(pubkey))
expectType<P2PKHLockScript>(nimble.Script.templates.P2PKHLockScript.fromAddress(address.toString()))
expectType<P2PKHLockScript>(nimble.Script.templates.P2PKHLockScript.fromAddress(object))

// Transaction Output
const satoshis = 1
const tx = new nimble.Transaction()
expectType<classes.Transaction.Output>(new nimble.Transaction.Output(script, satoshis))
expectType<classes.Transaction.Output>(new nimble.Transaction.Output(buffer, satoshis))
expectType<classes.Transaction.Output>(new nimble.Transaction.Output(tx.output.toString(), satoshis))
expectType<classes.Transaction.Output>(new nimble.Transaction.Output(script, satoshis, tx))
expectType<classes.Transaction.Output>(new nimble.Transaction.Output(buffer, satoshis, tx))
expectType<classes.Transaction.Output>(new nimble.Transaction.Output(tx.output.toString(), satoshis, tx))

const output = tx.outputs[0]
expectType<string>(output.txid)
expectType<number>(output.vout)
expectType<number>(output.satoshis)
expectType<Script | P2PKHLockScript>(output.script)
expectType<Transaction>(output.tx)

// Transaction Input
const vout = 0
const sequence = 0
expectType<classes.Transaction.Input>(new nimble.Transaction.Input(tx.hash, vout))
expectType<classes.Transaction.Input>(new nimble.Transaction.Input(tx.hash, vout, script))
expectType<classes.Transaction.Input>(new nimble.Transaction.Input(tx.hash, vout, script, sequence))
expectType<classes.Transaction.Input>(new nimble.Transaction.Input(tx.hash, vout, script, sequence, output))

const input = tx.inputs[0]
expectType<Script>(input.script)
expectType<number>(input.vout)
expectType<number>(input.sequence)
expectType<string>(input.txid)

// Transaction
expectType<Transaction>(new nimble.Transaction())

expectType<string>(tx.hash)
expectType<number>(tx.fee)
expectType<number>(tx.version)
expectType<classes.Transaction.Input[]>(tx.inputs)
expectType<classes.Transaction.Output[]>(tx.outputs)
expectType<classes.Transaction.Output | null>(tx.changeOutput)
expectType<number>(tx.locktime)

expectType<Transaction>(tx.to(address, satoshis))
expectType<Transaction>(tx.to(pubkey, satoshis))
expectType<Transaction>(tx.to(address.toString(), satoshis))
expectType<Transaction>(tx.to(object, satoshis))
expectType<Transaction>(tx.input(input))
expectType<Transaction>(tx.input({ txid: tx.hash, vout, script, sequence, output}))
expectType<Transaction>(tx.input({ txid: tx.hash, vout, script: address.toScript(), sequence, output}))
expectType<Transaction>(tx.input({ txid: undefined, vout: undefined, script, sequence, output}))
expectType<Transaction>(tx.output(output))
expectType<Transaction>(tx.output({script, satoshis}))
expectType<Transaction>(tx.change(address))
expectType<Transaction>(tx.change(pubkey))
expectType<Transaction>(tx.change(address.toString()))
expectType<Transaction>(tx.change(object))
expectType<Transaction>(tx.sign(privkey))
expectType<Transaction>(tx.sign(privkey.toString()))
expectType<Transaction>(tx.verify())
expectType<Transaction>(tx.finalize())
expectType<void>(tx._calculateChange())
expectType<Transaction>(tx.setFeePerKb(satoshis))

expectType<Transaction>(nimble.Transaction.fromString(tx.toString()))
expectType<Transaction>(nimble.Transaction.fromHex(tx.toHex()))
expectType<Transaction>(nimble.Transaction.fromBuffer(tx.toBuffer()))
expectType<Transaction>(nimble.Transaction.from(output))
expectType<Transaction>(nimble.Transaction.from(tx.outputs))

expectType<string>(tx.toString())
expectType<string>(tx.toHex())
expectType<ByteArray>(tx.toBuffer())

// Functions
const str = 'nimble'
const signature: nimble.Signature = { r: buffer, s: buffer }
const parent: nimble.ParentTx = {satoshis: 0, script: buffer}
expectType<boolean>(nimble.functions.areBuffersEqual(buffer, buffer))
expectType<ByteArray>(nimble.functions.calculatePublicKeyHash(pubkey.point))
expectType<nimble.Point>(nimble.functions.calculatePublicKey (buffer))
expectType<string>(nimble.functions.calculateTxid(buffer))
expectType<ByteArray>(nimble.functions.createP2PKHLockScript(buffer))
expectType<ByteArray>(nimble.functions.createP2PKHUnlockScript(buffer, buffer))
expectType<{testnet: boolean, pubkeyhash: ByteArray}>(nimble.functions.decodeAddress(str))
expectType<ByteArray>(nimble.functions.decodeASM(str))
expectType<{version: number, payload: ByteArray}>(nimble.functions.decodeBase58Check(str))
expectType<ByteArray>(nimble.functions.decodeBase58(str))
expectType<ByteArray>(nimble.functions.decodeBase64(str))
expectType<Signature>(nimble.functions.decodeDER(buffer))
expectType<ByteArray>(nimble.functions.decodeHex(str))
expectType<nimble.Point>(nimble.functions.decodePublicKey(buffer))
expectType<nimble.Chunk[]>(nimble.functions.decodeScriptChunks(buffer))
expectType<nimble.tx>(nimble.functions.decodeTx(buffer));
expectType<{number: ByteArray, testnet: boolean, compressed: boolean}>(nimble.functions.decodeWIF(str))
expectType<Signature | null>(nimble.functions.ecdsaSign(buffer, buffer, point))
expectType<Promise<Signature>>(nimble.functions.ecdsaSignAsync(buffer, buffer, point))
expectType<Signature | null>(nimble.functions.ecdsaSignWithK(buffer, buffer, buffer, point))
expectType<boolean>(nimble.functions.ecdsaVerify(signature, buffer, point))
expectType<string>(nimble.functions.encodeAddress(buffer, false))
expectType<string>(nimble.functions.encodeBase58(buffer))
expectType<ByteArray>(nimble.functions.encodeDER(buffer))
expectType<string>(nimble.functions.encodeHex(buffer))
expectType<ByteArray>(nimble.functions.encodePublicKey(point, false))
expectType<ByteArray>(nimble.functions.encodePushData (buffer))
expectType<ByteArray>(nimble.functions.encodeTx(tx))
expectType<string>(nimble.functions.encodeWIF(buffer, false))
expectType<string>(nimble.functions.encodeWIF(buffer, false, false))
expectType<nimble.evalResult>(nimble.functions.evalScript(buffer, buffer, tx, 0, 0))
expectType<nimble.evalResult>(nimble.functions.evalScript(buffer, buffer, tx, 0, 0, { async: false, trace: false}))
expectType<ByteArray>(nimble.functions.extractP2PKHLockScriptPubkeyhash (buffer))
expectType<ByteArray>(nimble.functions.generatePrivateKey())
expectType<ByteArray>(nimble.functions.generateRandomData(0))
expectType<boolean>(nimble.functions.isBuffer(buffer))
expectType<boolean>(nimble.functions.isHex(str))
expectType<boolean>(nimble.functions.isP2PKHLockScript(buffer))
expectType<ByteArray>(nimble.functions.preimage(tx, 0, buffer, 0, 0))
expectType<ByteArray>(nimble.functions.preimage(tx, 0, buffer, 0, 0, false))
expectType<Promise<ByteArray>>(nimble.functions.preimageAsync(tx, 0, buffer, 0, 0))
expectType<nimble.BlockHeader>(nimble.functions.readBlockHeader(bufferReader))
expectType<{r: ByteArray, s: ByteArray}>(nimble.functions.readDER(bufferReader))
expectType<nimble.tx>(nimble.functions.readTx(bufferReader))
expectType<number>(nimble.functions.readU32LE(bufferReader))
expectType<number>(nimble.functions.readU64LE(bufferReader))
expectType<number>(nimble.functions.readVarint(bufferReader))
expectType<ByteArray>(nimble.functions.ripemd160(buffer))
expectType<Promise<ByteArray>>(nimble.functions.ripemd160Async(buffer))
expectType<ByteArray>(nimble.functions.sha1(buffer))
expectType<Promise<ByteArray>>(nimble.functions.sha1Async(buffer))
expectType<ByteArray>(nimble.functions.sha256(buffer))
expectType<ByteArray>(nimble.functions.sha256d(buffer))
expectType<ByteArray>(nimble.functions.sha256ripemd160(buffer))
expectType<ByteArray>(nimble.functions.sighash(tx, 0, buffer, 0, 0))
expectType<ByteArray>(nimble.functions.sighash(tx, 0, buffer, 0, 0, false))
expectType<Promise<ByteArray>>(nimble.functions.sighashAsync(tx, 0, buffer, 0, 0))
expectType<nimble.Point>(nimble.functions.verifyPoint(point))
expectType<ByteArray>(nimble.functions.verifyPrivateKey (buffer))
expectType<Error | boolean>(nimble.functions.verifyScript(buffer, buffer, tx, 0, 0))
expectType<Error | boolean>(nimble.functions.verifyScript(buffer, buffer, tx, 0, 0, false))
expectType<Promise<Error | boolean>>(nimble.functions.verifyScriptAsync(buffer, buffer, tx, 0, 0))
expectType<boolean>(nimble.functions.verifyTxSignature(tx, 0, buffer, point, buffer, 0))
expectType<void>(nimble.functions.verifyTx(tx, [parent], 0))
expectType<void>(nimble.functions.writeDER(bufferWriter, signature))
expectType<classes.BufferWriter>(nimble.functions.writePushData(bufferWriter, buffer))
expectType<void>(nimble.functions.writeTx(bufferWriter, tx))
expectType<classes.BufferWriter>(nimble.functions.writeU32LE(bufferWriter, 0))
expectType<classes.BufferWriter>(nimble.functions.writeU64LE(bufferWriter, 0))
expectType<classes.BufferWriter>(nimble.functions.writeVarint(bufferWriter, 0))
