export const version: string;
export const testnet: boolean;
export const feePerKb: number;

export module classes {
  export class BufferReader {
    constructor(buffer: ByteArray, pos?: number);
      
    read(length: number): ByteArray;
    close(): void;
    checkRemaining(length: number): void;
  }
      
  export class BufferWriter {
    constructor();
      
    write(buffer: ByteArray): BufferWriter;
    toBuffer(): ByteArray;
  }

  export class PrivateKey {
    constructor(number: ByteArray, testnet: boolean, compressed: boolean, validate?: boolean);
  
    readonly compressed: boolean;
    readonly testnet: boolean;
    readonly number: ByteArray;
  
    static from(privateKey: PrivateKey | string | Object ): PrivateKey;
    static fromString(wif: string): PrivateKey;
    static fromRandom(testnet?: boolean): PrivateKey;
  
    toAddress(): Address;
    toPublicKey(): PublicKey;
    toString(): string;
  }

  export class PublicKey {
    constructor(point: Point, testnet: boolean, compressed: boolean, validate?: boolean);

    readonly compressed: boolean;
    readonly testnet: boolean;
    readonly point: Point;

    static from(x: PublicKey | PrivateKey | string | Object): PublicKey;
    static fromString(pubkey: string): PublicKey;
    static fromPrivateKey(privateKey: PrivateKey): PublicKey;

    toAddress(): Address;
    toString(): string;
    toBuffer(): ByteArray;
  }

  export class Address {
    constructor(pubkeyhash: ByteArray, testnet: boolean, validate?: boolean);

    readonly testnet: boolean;
    readonly pubkeyhash: ByteArray;

    static from(x: Address | PublicKey | string | Object): Address;
    static fromString(s: string): Address;
    static fromPublicKey(publicKey: PublicKey): Address;

    toString(): string;
    toScript(): P2PKHLockScript;
  }

  type scriptTemplates = {
    P2PKHLockScript: P2PKHLockScript
  }

  export class Script {
    constructor(buffer?: ByteArray, validate?: boolean);

    readonly buffer: ByteArray;
    readonly length: number;
    readonly chunks: Chunk[];

    static slice(start: number, end: number): ByteArray;

    static fromString(s: string): Script;
    static fromHex(s: string): Script;
    static fromASM(s: string): Script;
    static fromBuffer(buffer: ByteArray): Script;
    static from(script: Script | ByteArray | string | Object): Script;
    
    static templates: scriptTemplates;

    toString(): string;
    toASM(): string;
    toHex(): string;
    toBuffer(): ByteArray;
  }

  export namespace Transaction {
    export class Output {
      constructor(script: Script | ByteArray | string, satoshis: number, tx?: Transaction);

      readonly txid: string;
      readonly vout: number;
      readonly satoshis: number;
      readonly script: Script | P2PKHLockScript;
      readonly tx: Transaction;
    }

    export class Input {
      constructor(txid: string, vout: number, script?: Script, sequence?: number, output?: Output);

      readonly script: Script;
      readonly vout: number;
      readonly sequence: number;
      readonly txid: string;
    }
  }

  export class Transaction {
    constructor();

    readonly hash: string;
    readonly fee: number;
    readonly version: number;
    readonly inputs: Transaction.Input[];
    readonly outputs: Transaction.Output[];
    readonly changeOutput: Transaction.Output | null;

    locktime: number;

    to(address: Address | PublicKey | string | Object, satoshis: number): Transaction;
    input(input: Transaction.Input | {
      txid: string | undefined,
      vout: number | undefined,
      script: Script | P2PKHLockScript,
      sequence: number,
      output: Transaction.Output }): Transaction;
    output(output: Transaction.Output | { script: Script; satoshis: number }): Transaction;
    change(address: Address | PublicKey | string | Object): Transaction;
    sign(privateKey: PrivateKey | string): Transaction;
    verify(): Transaction;
    finalize(): Transaction;
    _calculateChange(): void;
    setFeePerKb(satoshis: number): Transaction;

    static fromString(hex: string): Transaction;
    static fromHex(hex: string): Transaction;
    static fromBuffer(buffer: ByteArray): Transaction;
    static from(output: Transaction.Output | Transaction.Output[]): Transaction;
  
    toString(): string;
    toHex(): string;
    toBuffer(): ByteArray;
  }
}

declare interface P2PKHLockScript extends Script {
  matches(buffer: ByteArray): boolean;
  fromAddress(address: Address | PublicKey | string | Object): P2PKHLockScript;
  toAddress(): Address;
}

export class functions {
  static areBuffersEqual(a: ByteArray, b: ByteArray): boolean;
  static calculatePublicKeyHash(publicKey: Point): ByteArray;
  static calculatePublicKey (privateKey: ByteArray): Point;
  static calculateTxid(buffer: ByteArray): string;
  static createP2PKHLockScript(pubkeyhash: ByteArray): ByteArray;
  static createP2PKHUnlockScript(signature: ByteArray, pubkey: ByteArray): ByteArray;
  static decodeAddress(address: string): {testnet: boolean, pubkeyhash: ByteArray};
  static decodeASM(script: string): ByteArray;
  static decodeBase58Check(s: string): {version: number, payload: ByteArray};
  static decodeBase58(s: string): ByteArray;
  static decodeBase64(b64: string): ByteArray;
  static decodeDER(buffer: ByteArray): Signature;
  static decodeHex(hex: string): ByteArray;
  static decodePublicKey(buffer: ByteArray): Point;
  static decodeScriptChunks(script: ByteArray): Chunk[];
  static decodeTx(buffer: ByteArray): tx;
  static decodeWIF(privkey: string): {number: ByteArray, testnet: boolean, compressed: boolean};
  static ecdsaSign(hash32: ByteArray, privateKey: ByteArray, publicKey: Point): Signature | null;
  static ecdsaSignAsync(hash32: ByteArray, privateKey: ByteArray, publicKey: Point): Promise<Signature>;
  static ecdsaSignWithK(hash32: ByteArray, k: ByteArray, privateKey: ByteArray, publicKey: Point): Signature | null;
  static ecdsaVerify(signature: Signature, hash32: ByteArray, publicKey: Point): boolean;
  static encodeAddress(pubkeyhash: ByteArray, testnet: boolean): string;
  static encodeBase58(payload: ByteArray): string;
  static encodeDER(signature: ByteArray): ByteArray;
  static encodeHex(buffer: ByteArray): string;
  static encodePublicKey(publicKey: Point, compress: boolean): ByteArray;
  static encodePushData (buffer: ByteArray): ByteArray;
  static encodeTx(tx: Transaction): ByteArray;
  static encodeWIF(payload: ByteArray, testnet: boolean, compressed?: boolean): string;
  static evalScript(unlockScript: ByteArray, lockScript: ByteArray, tx: Transaction, vin: number, parentSatoshis: number, opts?: { async?: boolean, trace?: boolean}): evalResult;
  static extractP2PKHLockScriptPubkeyhash (script: ByteArray): ByteArray;
  static generatePrivateKey(): ByteArray;
  static generateRandomData(size: number): ByteArray;
  static isBuffer(a: any): boolean;
  static isHex(s: string): boolean;
  static isP2PKHLockScript(script: ByteArray): boolean;
  static preimage(tx: Transaction, vin: number, parentScript: ByteArray, parentSatoshis: number, sighashFlags: number, async?: boolean): ByteArray;
  static preimageAsync(tx: Transaction, vin: number, parentScript: ByteArray, parentSatoshis: number, sighashFlags: number): Promise<ByteArray>;
  static readBlockHeader(reader: classes.BufferReader): BlockHeader;
  static readDER(reader: classes.BufferReader): {r: ByteArray, s: ByteArray};
  static readTx(reader: classes.BufferReader): tx;
  static readU32LE(reader: classes.BufferReader): number;
  static readU64LE(reader: classes.BufferReader): number;
  static readVarint(reader: classes.BufferReader): number;
  static ripemd160(data: ByteArray): ByteArray;
  static ripemd160Async(data: ByteArray): Promise<ByteArray>;
  static sha1(data: ByteArray): ByteArray;
  static sha1Async(data: ByteArray): Promise<ByteArray>;
  static sha256(data: ByteArray): ByteArray;
  static sha256d(data: ByteArray): ByteArray;
  static sha256ripemd160(data: ByteArray): ByteArray;
  static sighash(tx: Transaction, vin: number, parentScript: ByteArray, parentSatoshis: number, sighashFlags: number, async?: boolean): ByteArray;
  static sighashAsync(tx: Transaction, vin: number, parentScript: ByteArray, parentSatoshis: number, sighashFlags: number): Promise<ByteArray>;
  static verifyPoint(publicKey: Point): Point;
  static verifyPrivateKey (privateKey: ByteArray): ByteArray;
  static verifyScript(unlockScript: ByteArray, lockScript: ByteArray, tx: Transaction, vin: number, parentSatoshis: number, async?: boolean): Error | boolean;
  static verifyScriptAsync(unlockScript: ByteArray, lockScript: ByteArray, tx: Transaction, vin: number, parentSatoshis: number): Promise<Error | boolean>;
  static verifyTxSignature(tx: Transaction, vin: number, signature: ByteArray, pubkey: Point, parentScript: ByteArray, parentSatoshis: number): boolean;
  static verifyTx(tx: Transaction, parents: ParentTx[], minFeePerKb: number): void;
  static writeDER(writer: classes.BufferWriter, signature: Signature): void; 
  static writePushData(writer: classes.BufferWriter, buffer: ByteArray): classes.BufferWriter;
  static writeTx(writer: classes.BufferWriter, tx: Transaction): void;
  static writeU32LE(writer: classes.BufferWriter, n: number): classes.BufferWriter;
  static writeU64LE(writer: classes.BufferWriter, n: number): classes.BufferWriter;
  static writeVarint(writer: classes.BufferWriter, n: number): classes.BufferWriter;
}

export class PrivateKey extends classes.PrivateKey {}
export class PublicKey extends classes.PublicKey {}
export class Address extends classes.Address {}
export class Script extends classes.Script {}
export class Transaction extends classes.Transaction {}

export type BufferReader = classes.BufferReader;
export type BufferWriter = classes.BufferWriter;

export interface ByteArray extends Iterable<number> {
  length: number;
}

export type Point = {
  x: ByteArray;
  y: ByteArray;
}

export type Chunk = {
  opcode: number;
  buf?: ByteArray;
}

type Signature = {
  r: ByteArray;
  s: ByteArray;
}

type BlockHeader = {
  version: number;
  prevBlock: ByteArray;
  merkleRoot: ByteArray;
  timestamp: number;
  bits: number;
  nonce: number;
}

type tx = {
  version: number;
  inputs: classes.Transaction.Input[];
  outputs: classes.Transaction.Output[];
  locktime: number;
}

type evalResult = {
  success: boolean;
  error: Error | null;
  chunks: Chunk[];
  stack: string;
  stackTrace: string;
}

type ParentTx = {
  script: ByteArray;
  satoshis: number;
}
