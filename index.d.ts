export const version: string
export const testnet: boolean
export const feePerKb: number

export module classes {
  export class BufferReader {
    constructor(buffer: ByteArray, pos?: number)

    read(length: number): ByteArray
    close(): void
    checkRemaining(length: number): void
  }

  export class BufferWriter {
    constructor()

    write(buffer: ByteArray): BufferWriter
    toBuffer(): ByteArray
  }

  export class PrivateKey {
    constructor(
      number: ByteArray,
      testnet: boolean,
      compressed: boolean,
      validate?: boolean
    )

    readonly compressed: boolean
    readonly testnet: boolean
    readonly number: ByteArray

    static from(privateKey: PrivateKey | string | Object): PrivateKey
    static fromString(wif: string): PrivateKey
    static fromRandom(testnet?: boolean): PrivateKey

    toAddress(): Address
    toPublicKey(): PublicKey
    toString(): string
  }

  export class PublicKey {
    constructor(
      point: Point,
      testnet: boolean,
      compressed: boolean,
      validate?: boolean
    )

    readonly compressed: boolean
    readonly testnet: boolean
    readonly point: Point

    static from(x: PublicKey | PrivateKey | string | Object): PublicKey
    static fromString(pubkey: string): PublicKey
    static fromPrivateKey(privateKey: PrivateKey): PublicKey

    toAddress(): Address
    toString(): string
    toBuffer(): ByteArray
  }

  export class Address {
    constructor(pubkeyhash: ByteArray, testnet: boolean, validate?: boolean)

    readonly testnet: boolean
    readonly pubkeyhash: ByteArray

    static from(x: Address | PublicKey | string | Object): Address
    static fromString(s: string): Address
    static fromPublicKey(publicKey: PublicKey): Address

    toString(): string
    toScript(): P2PKHLockScript
  }

  type scriptTemplates = {
    P2PKHLockScript: P2PKHLockScript
  }

  export class Script {
    constructor(buffer?: ByteArray, validate?: boolean)

    readonly buffer: ByteArray
    readonly length: number
    readonly chunks: Chunks[]

    static slice(start: number, end: number): ByteArray

    static fromString(s: string): Script
    static fromHex(s: string): Script
    static fromASM(s: string): Script
    static fromBuffer(buffer: ByteArray): Script
    static from(script: Script | ByteArray | string | Object): Script

    static templates: scriptTemplates

    toString(): string
    toASM(): string
    toHex(): string
    toBuffer(): ByteArray
  }

  export namespace Transaction {
    export class Output {
      constructor(
        script: Script | ByteArray | string,
        satoshis: number,
        tx?: Transaction
      )

      readonly txid: string
      readonly vout: number
      readonly satoshis: number
      readonly script: Script | P2PKHLockScript
      readonly tx: Transaction
    }

    export class Input {
      constructor(
        txid: string,
        vout: number,
        script?: Script,
        sequence?: number,
        output?: Output
      )

      readonly script: Script
      readonly vout: number
      readonly sequence: number
      readonly txid: string
    }
  }

  export class Transaction {
    constructor()

    readonly hash: string
    readonly fee: number
    readonly version: number
    readonly inputs: Transaction.Input[]
    readonly outputs: Transaction.Output[]
    readonly changeOutput: Transaction.Output | null

    locktime: number

    to(
      address: Address | PublicKey | string | Object,
      satoshis: number
    ): Transaction
    input(
      input:
        | Transaction.Input
        | {
            txid: string | undefined
            vout: number | undefined
            script: Script | P2PKHLockScript
            sequence: number
            output: Transaction.Output
          }
    ): Transaction
    output(
      output: Transaction.Output | { script: Script; satoshis: number }
    ): Transaction
    change(address: Address | PublicKey | string | Object): Transaction
    sign(privateKey: PrivateKey | string): Transaction
    verify(): Transaction
    finalize(): Transaction
    _calculateChange(): void

    static fromString(hex: string): Transaction
    static fromHex(hex: string): Transaction
    static fromBuffer(buffer: ByteArray): Transaction
    static from(output: Transaction.Output | Transaction.Output[]): Transaction

    toString(): string
    toHex(): string
    toBuffer(): ByteArray
  }
}

declare interface P2PKHLockScript extends Script {
  matches(buffer: ByteArray): boolean
  fromAddress(address: Address | PublicKey | string | Object): P2PKHLockScript
  toAddress(): Address
}

export class PrivateKey extends classes.PrivateKey {}
export class PublicKey extends classes.PublicKey {}
export class Address extends classes.Address {}
export class Script extends classes.Script {}
export class Transaction extends classes.Transaction {}

export type BufferReader = classes.BufferReader
export type BufferWriter = classes.BufferWriter

export interface ByteArray extends Iterable<number> {
  length: number
}

export type Point = {
  x: ByteArray
  y: ByteArray
}

export type Chunks = {
  opcode: number
  buf?: ByteArray
}
