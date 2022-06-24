import { expectType } from 'tsd'
import nimble, {
  Address,
  BufferReader,
  classes,
  P2PKHLockScript,
  PrivateKey,
  PublicKey,
  Script, 
  Transaction} from '../index'

expectType<string>(nimble.version)
expectType<boolean>(nimble.testnet)
expectType<number>(nimble.feePerKb)

// Buffer reader & writer
const buffer = Buffer.from('nimble');
expectType<BufferReader>(new nimble.classes.BufferReader(buffer))
expectType<BufferReader>(new nimble.classes.BufferReader(buffer, 0))

const bufferReader = new nimble.classes.BufferReader(buffer)
expectType<Buffer>(bufferReader.read(0))
expectType<void>(bufferReader.close())
expectType<void>(bufferReader.checkRemaining(0))

const bufferWriter = new nimble.classes.BufferWriter()
expectType<classes.BufferWriter>(new nimble.classes.BufferWriter())
expectType<classes.BufferWriter>(bufferWriter.write(buffer))
expectType<classes.BufferWriter>(bufferWriter.write([0, 106]))
expectType<Uint8Array>(bufferWriter.toBuffer())

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
expectType<Buffer>(privkey.number)

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
expectType<Uint8Array>(pubkey.toBuffer())

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
expectType<Uint8Array>(address.pubkeyhash)
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
expectType<Script>(nimble.Script.fromBuffer(Buffer.from(script.toBuffer())))
expectType<Script>(nimble.Script.fromHex(script.toHex()))
expectType<Script>(nimble.Script.from(script))
expectType<Script>(nimble.Script.from(script.toBuffer()))
expectType<Script>(nimble.Script.from(Buffer.from(script.toBuffer())))
expectType<Script>(nimble.Script.from(script.toString()))
expectType<Script>(nimble.Script.from(object))

expectType<Uint8Array>(script.buffer)
expectType<number>(script.length)
expectType<nimble.Chunks[]>(script.chunks)

expectType<string>(script.toASM())
expectType<Uint8Array>(script.toBuffer())
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

expectType<Transaction>(nimble.Transaction.fromString(tx.toString()))
expectType<Transaction>(nimble.Transaction.fromHex(tx.toHex()))
expectType<Transaction>(nimble.Transaction.fromBuffer(tx.toBuffer()))
expectType<Transaction>(nimble.Transaction.fromBuffer(Buffer.from(tx.toBuffer())))
expectType<Transaction>(nimble.Transaction.from(output))
expectType<Transaction>(nimble.Transaction.from(tx.outputs))

expectType<string>(tx.toString())
expectType<string>(tx.toHex())
expectType<Uint8Array>(tx.toBuffer())
