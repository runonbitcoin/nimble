export const version: string;
export const testnet: boolean;
export const feePerKb: number;

export module classes {
  export class BufferReader {
    constructor(buffer: Uint8Array | number[], pos?: number);
      
    read(length: number): Uint8Array;
    close(): void;
    checkRemaining(length: number): void;
  }
      
  export class BufferWriter {
    constructor();
      
    write(buffer: Uint8Array | number[]): BufferWriter;
    toBuffer(): Uint8Array;
  }

  export class PrivateKey {
    constructor(number: Uint8Array, testnet: boolean, compressed: boolean, validate?: boolean);
  
    readonly compressed: boolean;
    readonly testnet: boolean;
    readonly number: Uint8Array;
  
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
    toBuffer(): Uint8Array;
  }

  export class Address {
    constructor(pubkeyhash: Uint8Array, testnet: boolean, validate?: boolean);

    readonly testnet: boolean;
    readonly pubkeyhash: Uint8Array;

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
    constructor(buffer?: Uint8Array | number[], validate?: boolean);

    readonly buffer: Uint8Array;
    readonly length: number;
    readonly chunks: Chunks[];

    static slice(start: number, end: number): Uint8Array;

    static fromString(s: string): Script;
    static fromHex(s: string): Script;
    static fromASM(s: string): Script;
    static fromBuffer(buffer: Uint8Array | number[]): Script;
    static from(script: Script | Uint8Array | number[] | string | Object): Script;
    
    static templates: scriptTemplates;

    toString(): string;
    toASM(): string;
    toHex(): string;
    toBuffer(): Uint8Array;
  }

  export namespace Transaction {
    export class Output {
      constructor(script: Script | Uint8Array | number[] | string, satoshis: number, tx?: Transaction);

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

    static fromString(hex: string): Transaction;
    static fromHex(hex: string): Transaction;
    static fromBuffer(buffer: Uint8Array): Transaction;
    static from(output: Transaction.Output | Transaction.Output[]): Transaction;
  
    toString(): string;
    toHex(): string;
    toBuffer(): Uint8Array;
  }
}

declare interface P2PKHLockScript extends Script {
  matches(buffer: Uint8Array | number[]): boolean;
  fromAddress(address: Address | PublicKey | string | Object): P2PKHLockScript;
  toAddress(): Address;
}

export class PrivateKey extends classes.PrivateKey {}
export class PublicKey extends classes.PublicKey {}
export class Address extends classes.Address {}
export class Script extends classes.Script {}
export class Transaction extends classes.Transaction {}

export type BufferReader = classes.BufferReader
export type BufferWriter = classes.BufferWriter

export type Point = {
  x: Uint8Array;
  y: Uint8Array;
};

export type Chunks = {
  opcode: number;
  buf?: Uint8Array | number[];
};
