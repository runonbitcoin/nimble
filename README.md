# nimble

[![tests](https://github.com/runonbitcoin/nimble/workflows/tests/badge.svg)](https://github.com/runonbitcoin/nimble/actions) [![codecov](https://codecov.io/gh/runonbitcoin/nimble/branch/main/graph/badge.svg?token=DEA91M2f1o)](https://codecov.io/gh/runonbitcoin/nimble)

## Introduction

`nimble` is a practical everyday Javascript library for Bitcoin SV.

It is designed to be exceptionally small, fast, and capable of the same popular features as alternative libraries.

## Examples

`nimble`'s classes are going to feel familiar to developers that use bsv.js v1 or bitcore-lib.

Generate a new random private key

```
const privateKey = nimble.PrivateKey.fromRandom()

console.log(privateKey.toString())
```

Print the public key and address for a private key

```
const privateKey = nimble.PrivateKey.fromString('<private-key-wif-string>')

console.log(privateKey.toPublicKey().toString())
console.log(privateKey.toAddress().toString())
```

Create a simple P2PKH payment transaction

```
const transaction = new nimble.Transaction()
    .from(utxo)
    .to(address, satoshis)
    .sign(privateKey)

const rawtx = transaction.toString()
```

Calculate a transaction's txid

```
const transaction = nimble.Transaction.fromString('<rawtx>')

console.log(transaction.hash)
```

## Advanced API

`nimble` also provides a lower-level API for advanced developers. Every class above is wrapper around underlying functions that you may discover and use directly.

Hash a message with SHA-256

```
const hash = nimble.functions.sha256(buffer)
```

Stream decode several transactions

```
const reader = new nimble.classes.BufferReader(data)
const tx1 = nimble.functions.readTx(reader)
const tx2 = nimble.functions.readTx(reader)
const tx3 = nimble.functions.readTx(reader)
reader.close()
```

## Using on testnet

Testnet mode must be enabled to correctly generate private keys and addresses on testnet and STN.

To enable, set the global testnet flag to `true`:

```
nimble.testnet = true
```

## Using nimble piecemeal

For smaller builds and faster load times, you may consume only parts of the nimble library instead of the whole thing.

We've handily separated out each function or class into their own modules. Append the subpath to the class or function in your `require()` or `import` paths:

```
const decodeTx = require('nimble/functions/decode-tx')
const calculateTxid = require('nimble/functions/calculate-txid')

const tx = decodeTx(buffer)
const txid = calculateTxid(tx)
```

You can also optimize the size further by telling your bundler where you intend for nimble to be used by setting the global variable `VARIANT` to either `"node"` or `"browser"`

## Comparison to other libraries

### Size

nimble's main advantage is its size. All other bsv libraries measure hundreds of kilobytes, but sitting at only 64 kb, nimble is the smallest and fastest-loading library among them by a large margin. After gzipping, nimble is further reduced to only 23 kb and the library may even be consumed in pieces. Size was optimized because it leads to faster loading and app responsiveness.

### Ease of use

nimble's classes are very similar to the bsv.js v1 library. This is intentional. Many developers expressed that they prefer the bsv1 API over bsv2 because it is easier to use even though the bsv2 offers more. A few of the bsv v1 constructors though have been changed to static functions like `nimble.PrivateKey.fromRandom()` instead of `new bsv.PrivateKey()`, borrowing from bsv2 and bsv-wasm. However overall, many of the convenient methods and data structures are the same. For advanced users, nimble still has lower-level functions that are similar to bsv.js v2. Compared to bsv-wasm, nimble keeps its source of truth in JavaScript rather than in WASM. This means you don't have to free memory manually. Also, nimble WASM modules are all under 4 kb enabling the library can load synchronously without need of an async function wrapper.

### Speed

nimble should always be faster than bsv.js and certainly fast enough for everyday use. But it is not faster than bsv-wasm.js, which optimizes for speed above other metrics. This is a trade-off. bsv-wasm's speed comes at a cost though as its size and loading time is much longer than nimble. It should be possible to incorporate some of those techniques used by bsv-wasm into nimble over time to narrow the performance gap, but probably not at the expense of size or being able to synchronously load the library. In our view, it's fast enough.

**Size Comparison**

| Library  | Size (KB) | Gzipped (KB) |
| -------- | --------- | ------------ |
| nimble   | 64        | 23           |
| bsv1     | 326       | 98           |
| bsv2     | 373       | 113          |
| bsv-wasm | 687       | 206          |

**Performance Comparison**

| Library  | Load (ms) | Generate Keypair (ms) | Calculate Address (ms) | Sign Tx (ms) | Verify Signature (ms) | SHA256 (ms) |
| -------- | --------- | --------------------- | ---------------------- | ------------ | --------------------- | ----------- |
| nimble   | 11        | 2                     | 0.2                    | TBD          | TBD                   | 0           |
| bsv1     | 24        | 6.8                   | 0.3                    | TBD          | TBD                   | 1.2         |
| bsv2     | 32        | 8.5                   | 0.5                    | TBD          | TBD                   | 0.7         |
| bsv-wasm | 56        | 0.4                   | 0                      | TBD          | TBD                   | 0           |

* Load performance was captured by loading the library from cache and calling any init functions
* All others were captured by performing the operation 100 times in Chrome and taking the average

**Feature Comparison**

| Feature                      | nimble | bsv1 | bsv2 | bsv-wasm | 
| ---------------------------- | ------ | ---- | ---- | -------- |
| Generate keypairs            | ✅ | ✅ | ✅ | ✅ |
| Calculate addresses          | ✅ | ✅ | ✅ | ✅ |
| Encode/decode keys           | ✅ | ✅ | ✅ | ✅ |
| Serialize transactions       | ✅ | ✅ | ✅ | ✅ |
| Deserialize transactions     | ✅ | ✅ | ✅ | ✅ |
| Transaction builder          | ✅ | ✅ | ❌ | ❌ |
| Deconstruct scripts          | ✅ | ✅ | ✅ | ❌ |
| Custom genesis scripts       | ✅ | ❌ | ✅ | ✅ |
| Script interpreter           | ✅ | ✅ | ✅ | ❌ |
| Generate signatures          | ✅ | ✅ | ✅ | ✅ |
| Verify signatures            | ✅ | ✅ | ✅ | ✅ |
| Recover keys from signatures | ❌ | ❌ | ❌ | ✅ |
| Sighash flags                | ✅ | ✅ | ✅ | ✅ |
| P2PKH support                | ✅ | ✅ | ✅ | ✅ |
| Multisig support             | ❌ | ✅ | ✅ | ❌ |
| Threshold signatures         | ❌ | ❌ | ❌ | ❌ |
| SHA-256                      | ✅ | ✅ | ✅ | ✅ |
| SHA-1                        | ✅ | ✅ | ✅ | ✅ |
| SHA-512                      | ❌ | ✅ | ✅ | ✅ |
| RIPEMD-160                   | ✅ | ✅ | ✅ | ✅ |
| Sighash function             | ✅ | ✅ | ✅ | ✅ |
| Testnet support              | ✅ | ✅ | ✅ | ❌ |
| Synchronous initialization   | ✅ | ✅ | ✅ | ❌ |
| Automatic memory management  | ✅ | ✅ | ✅ | ❌ |
| Use library in parts         | ✅ | ✅ | ✅ | ❌ |
| Stream decode transactions   | ✅ | ❌ | ✅ | ❌ |
| Custom elliptic curve math   | ❌ | ✅ | ✅ | ❌ |
| Seed phrase mnemonics        | ❌ | ✅ | ✅ | ❌ |
| ECIES                        | ❌ | ✅ | ✅ | ✅ |
| HD keys                      | ❌ | ✅ | ✅ | ✅ |

## NPM commands

- `npm run lint` - Lint and automatically fix errors
- `npm run build` - Build outputs
- `npm run test` - Test library quickly
- `npm run test:cover` - Test and measure code coverage
- `npm run test:node` - Test the minified node build
- `npm run test:browser` - Test the minified browser build (Chrome default)

## Configuring the tests

Various environment variables may be used to configure the tests:

| Name              | Description                                     | Possible Values                                | Default     |
|-------------------|-------------------------------------------------|------------------------------------------------|-------------|
| `BROWSER`         | Browser used for testing                        | `chrome`, `firefox`, `safari`, `MicrosoftEdge` | `chrome`    |

### Examples

- `env BROWSER=safari npm run test:browser` - Test the browser build on Safari
