# nimble

[![tests](https://github.com/runonbitcoin/nimble/workflows/tests/badge.svg)](https://github.com/runonbitcoin/nimble/actions) [![codecov](https://codecov.io/gh/runonbitcoin/nimble/branch/main/graph/badge.svg?token=QX3hHriydo)](https://codecov.io/gh/runonbitcoin/nimble)

## Introduction

`nimble` is a practical everyday Javascript library for Bitcoin SV.

It is designed to be tiny, fast, and capable of the same commonly-used features as alternative libraries.

## Examples

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

Calculate and existing transaction's txid

```
const transaction = nimble.Transaction.fromString('<rawtx>')

console.log(transaction.hash)
```

## Using on testnet

Testnet mode must be enabled to correctly generate private keys and addresses on testnet and STN.

To enable, set the global testnet flag to `true`:

```
nimble.testnet = true
```

## Comparison to other libraries

nimble shares much of its API with bitcore-lib from which MoneyButton's bsv.js v1 library was based on. However, it is smaller and faster for everyday scenarios. This is possible because of its smaller footprint, as well as use of WebAssembly to optimize hashing and elliptic curve math. In addition, nimble may be consumed piecemeal, as individual functions or classes, rather than an entire library. bsv-wasm takes longer to load, sometimes signficantly so, but once it loads it is faster than nimble. bsv-wasm has many optimizations that increase its size. While some of these may be incorporated into nimble someday, nimble strives more for a more balanced approach. In addition, nimble synchronously loads so that it is easier to use in scripts, and does not require the user to call free() after they are done with objects.

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
| nimble   | 11        | 2                     | 0.2                    |              |                       | 0           |
| bsv1     | 24        | 6.8                   | 0.3                    |              |                       | 1.2         |
| bsv2     | 32        | 8.5                   | 0.5                    |              |                       | 0.7         |
| bsv-wasm | 56        | 0.4                   | 0                      |              |                       | 0           |

* Load performance was captured by loading the library from cache and calling any init functions
* All others were captured by performing the operation 100 times in Chrome and taking the average

**Feature Comparison**

<TODO>

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
