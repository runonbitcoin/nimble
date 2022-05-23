# WASM

The directories here each represent different WebAssembly modules used by nimble. We use C as our language because is offers the most concise compilations, especially when compared to its closest sibling Rust. Conciseness is important to stay under the [4K browser limit](https://github.com/w3c/ServiceWorker/issues/1499). These wasm modules are for reference only and are not automatically compiled into nimble.

**ripemd160**

- Optimized version of RIPEMD160 hashing algorithm. Used to generate addresses and validate scripts.
- Shares a memory space with the other hashing functions

**sha1**

- Optimized version of SHA1 hashing algorithm. Used to validate scripts.
- Shares a memory space with the other hashing functions

**sha256**

- Optimized version of SHA256 hashing algorithm. The default hashing algorithm used in many places in Bitcoin and nimble.
- Shares a memory space with the other hashing functions

**secp256k1**

- SECP256K1 logic based on Vitalik Buterin's [pybitcointools](https://github.com/vbuterin/pybitcointools/blob/aeb0a2bbb8bbfe421432d776c649650eaeb882a5/bitcoin/main.py), which is simpler and more concise than Peter Wuille's heavily-optimized [lib-secp256k1](https://github.com/bitcoin-core/secp256k1). 
- Hand-written big number implementation for signed integers
- Four WASM files are used - two for big numbers, and one for SECP256K1, another for ECDSA. They share a WASM memory space with a 1M memory offset.

## Setup

`npm run install` to install the WASI SDK used to compile

**Note**: WASM may not compile correctly on Windows. Linux and Mac have been tested.

## Build

1. `make` in any directory.
2. Copy the contents of the .base64 file into `wasm-hashes.js` or `wasm-secp256k1.js`
