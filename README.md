# nimble

[![tests](https://github.com/runonbitcoin/nimble/workflows/tests/badge.svg)](https://github.com/runonbitcoin/nimble/actions) [![codecov](https://codecov.io/gh/runonbitcoin/nimble/branch/main/graph/badge.svg?token=DEA91M2f1o)](https://codecov.io/gh/runonbitcoin/nimble)

`nimble` is a better BSV library.

It aims to be exceptionally small, fast, and easy to use, yet still just as capable as alternatives.

We built `nimble` first for ourselves at [Run](run.network), and we are excited now to launch it as a standalone library.

## Getting started

```
npm install @runonbitcoin/nimble
```

```
<script src="https://unpkg.com/@runonbitcoin/nimble@1.0"></script>
```

## Examples

nimble's classes are intended to feel familiar to developers that use bsv.js v1 or bitcore-lib.

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

nimble also has a lower-level API for advanced developers. Every class exampled above is actually a wrapper around underlying functions that you may discover and call directly.

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

There are asynchronous versions of the more expensive functions so check the functions directory.

## Using on testnet

Testnet mode must be enabled to correctly generate private keys and addresses on testnet and STN.

To enable, set the global testnet flag to `true`:

```
nimble.testnet = true
```

## Using nimble piecemeal

For smaller builds and faster load times, you can take only the parts of the library you need instead of the whole thing. We've handily separated out every function and class into its own module. Just append the subpath to the class or function in your `require()` or `import` paths:

```
const decodeTx = require('nimble/functions/decode-tx')
const calculateTxid = require('nimble/functions/calculate-txid')

const tx = decodeTx(buffer)
const txid = calculateTxid(tx)
```

You can optimize the size further by telling your bundler where you intend to use the library by setting the global variable `VARIANT` to either `"node"` or `"browser"`.

## Comparison to other libraries

### Size

nimble's main advantage is its small footprint. Other bsv libraries are hundreds of kilobytes, but sitting at a mere 64 kb, nimble is the smallest and fastest-loading library by a large margin. After gzipping, nimble is even further reduced to only 23 kb and may even be consumed peacemeal.

### Ease of use

nimble's class API is similar to the bsv1 library. This is intentional. Many developers express that they prefer the bsv1 API over bsv2 because it is easier to use, even as the bsv2 offers more functionality. nimble does make a few changes for clarity but largely follows its data structures and convenience methods. One difference is nimble's constructors - in nimble you instantiate classes using static functions like `nimble.PrivateKey.fromRandom()` rather than of `new bsv.PrivateKey()`. For advanced users, nimble has lower-level functions that are similar to bsv2.

Compared to bsv-wasm, nimble should be simpler to use. nimble is a JavaScript library first that uses WASM, where as bsv-wasm is a WASM library that has javascript bindings. It means in nimble you don't have to free memory manually and debugging is simpler. Also, because nimble WASM modules are kept under 4 kb the library loads immediately without need of an async function wrapper.

### Speed

nimble should always be faster than bsv.js and certainly fast enough for everyday use. But it is not faster than bsv-wasm, which optimizes for speed above other metrics. This is a trade-off. bsv-wasm's speed comes at a cost - its size is higher and loading time longer than nimble. It should be possible to incorporate some of bsv-wasm's optimizations into nimble over time to narrow the performance gap, but not at the expense of size or being able to synchronously load the library.

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

## Contributing

Please send pull requests for bug fixes, code optimizations, and feature proposals. See [issues](https://github.com/runonbitcoin/nimble/issues) for ideas.

Here are a few guidelines for contributions:

* New features should be implemented and tested as standalone functions first
* Class methods should always validate their parameters
* Please try not to regress code coverage

Thanks!

## Security

Run uses nimble on its backend today, and safety was a goal from its inception. nimble does not use third-party dependencies in its code, so it is not susceptible to most supply chain attacks. Its elliptic curve code is based on Vitalik Buterin's `pybitcointools` code which for a long time was the most used python bitcoin library. It also uses cryptographically secure random numbers when generating keys. However, please use common sense when managing keys and user assets. We take no responsibility for implementation decisions.

If you find a security issue, please email `security@run.network`.

## Development

### NPM commands

- `npm run lint` - Lint and automatically fix errors
- `npm run build` - Build outputs
- `npm run test` - Test library quickly
- `npm run test:cover` - Test and measure code coverage
- `npm run test:node` - Test the minified node build
- `npm run test:browser` - Test the minified browser build (Chrome default)

### Configuring the tests

Various environment variables may be used to configure the tests:

| Name              | Description                                     | Possible Values                                | Default     |
|-------------------|-------------------------------------------------|------------------------------------------------|-------------|
| `BROWSER`         | Browser used for testing                        | `chrome`, `firefox`, `safari`, `MicrosoftEdge` | `chrome`    |

#### Examples

- `env BROWSER=safari npm run test:browser` - Test the browser build on Safari
