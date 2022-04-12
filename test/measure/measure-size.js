const fs = require('fs')
const { gzipSync } = require('zlib')

const LITE_BSV = require.resolve('./node_modules/nimble/dist/nimble.browser.min.js')
const BSV1 = require.resolve('./node_modules/bsv1/bsv.min.js')
const BSV2 = require.resolve('./node_modules/bsv2/dist/bsv.bundle.js')
const BSV_WASM_JS = require.resolve('./node_modules/bsv-wasm/bsv_wasm.js')
const BSV_WASM_WASM = require.resolve('./node_modules/bsv-wasm/bsv_wasm_bg.wasm')

console.log('Size (KB)')
console.log('--------------------------------------------------')
console.log('nimble:', Math.round(fs.statSync(LITE_BSV).size / 1024))
console.log('bsv1:', Math.round(fs.statSync(BSV1).size / 1024))
console.log('bsv2:', Math.round(fs.statSync(BSV2).size / 1024))
console.log('bsv-wasm:', Math.round((fs.statSync(BSV_WASM_JS).size + fs.statSync(BSV_WASM_WASM).size) / 1024))

console.log('')

console.log('Gzip (KB)')
console.log('--------------------------------------------------')
console.log('nimble:', Math.round(gzipSync(fs.readFileSync(LITE_BSV)).length / 1024))
console.log('bsv1:', Math.round(gzipSync(fs.readFileSync(BSV1)).length / 1024))
console.log('bsv2:', Math.round(gzipSync(fs.readFileSync(BSV2)).length / 1024))
console.log('bsv-wasm:', Math.round((gzipSync(fs.readFileSync(BSV_WASM_JS)).length + gzipSync(fs.readFileSync(BSV_WASM_WASM)).length) / 1024))
