/**
 * All the settings to build variants using webpack
 */

const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const path = require('path')
const glob = require('glob')
const pkg = require('./package')

// ------------------------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------------------------

const LIB_PATH = path.join(__dirname, '.')
const DIST_PATH = path.join(__dirname, 'dist/')
const PKG_NAME = pkg.name.split('/').pop()
const LIBRARY_NAME = 'nimble'

const VERSION_PLUGIN = new webpack.DefinePlugin({ VERSION: JSON.stringify(pkg.version) })
const VARIANT_BROWSER_PLUGIN = new webpack.DefinePlugin({ VARIANT: JSON.stringify('browser') })
const VARIANT_NODE_PLUGIN = new webpack.DefinePlugin({ VARIANT: JSON.stringify('node') })

// ------------------------------------------------------------------------------------------------
// Terser options
// ------------------------------------------------------------------------------------------------

// Run library terser settings
const terserPluginConfig = {
  // The nameCache requires parallel to be off
  parallel: false,
  // We don't cache, because otherwise the name cache is lost
  // cache: false,
  terserOptions: {
    ecma: 2015,
    mangle: {
      properties: false
    }
  },
  // Leave license comments intact
  extractComments: false
}

// ------------------------------------------------------------------------------------------------
// Browser Minified
// ------------------------------------------------------------------------------------------------

const browserMin = {
  entry: LIB_PATH,
  output: {
    filename: `${PKG_NAME}.browser.min.js`,
    path: DIST_PATH,
    library: LIBRARY_NAME,
    libraryTarget: 'umd'
  },
  resolve: {
    mainFields: ['browser', 'main', 'module'],
    extensions: ['.js', '.mjs', '.wasm', '.json']
  },
  optimization: {
    minimizer: [
      new TerserPlugin(terserPluginConfig)
    ]
  },
  plugins: [
    VERSION_PLUGIN,
    VARIANT_BROWSER_PLUGIN
  ],
  stats: 'errors-only'
}

// ------------------------------------------------------------------------------------------------
// Node Minified
// ------------------------------------------------------------------------------------------------

const nodeMin = {
  ...browserMin,
  target: 'node',
  output: {
    filename: `${PKG_NAME}.node.min.js`,
    path: DIST_PATH,
    libraryTarget: 'commonjs2'
  },
  resolve: {
    mainFields: ['main', 'module'],
    extensions: ['.js', '.mjs', '.wasm', '.json']
  },
  plugins: [
    VERSION_PLUGIN,
    VARIANT_NODE_PLUGIN
  ]
}

// ------------------------------------------------------------------------------------------------
// Browser Original
// ------------------------------------------------------------------------------------------------

const browser = {
  ...browserMin,
  output: {
    filename: `${PKG_NAME}.browser.js`,
    path: DIST_PATH,
    library: LIBRARY_NAME
  },
  plugins: [
    VERSION_PLUGIN,
    VARIANT_BROWSER_PLUGIN
  ],
  optimization: { minimize: false }
}

// ------------------------------------------------------------------------------------------------
// Node Original
// ------------------------------------------------------------------------------------------------

const node = {
  ...nodeMin,
  output: {
    filename: `${PKG_NAME}.node.js`,
    path: DIST_PATH,
    libraryTarget: 'commonjs2'
  },
  plugins: [
    VERSION_PLUGIN,
    VARIANT_NODE_PLUGIN
  ],
  optimization: { minimize: false }
}

// ------------------------------------------------------------------------------------------------
// Browser Tests
// ------------------------------------------------------------------------------------------------

const patterns = process.env.SPECS ? JSON.parse(process.env.SPECS) : ['test']
const paths = new Set()
patterns.forEach(x => glob.sync(x).forEach(y => paths.add(y)))
const entries = Array.from(paths).map(x => path.join(process.cwd(), x))
if (!entries.length) throw new Error(`No test files found: ${patterns}`)

const browserTests = {
  target: 'web',
  entry: entries,
  output: {
    filename: `${PKG_NAME}.browser.tests.js`,
    path: DIST_PATH
  },
  node: { fs: 'empty' },
  externals: {
    mocha: 'mocha.Mocha',
    chai: 'chai',
    jsdom: 'jsdom',
    bsv: 'bsv',
    target: LIBRARY_NAME
  },
  optimization: { minimize: false },
  plugins: [new webpack.EnvironmentPlugin(process.env), VARIANT_BROWSER_PLUGIN],
  stats: 'errors-only'
}

// ------------------------------------------------------------------------------------------------

module.exports = [browserMin, nodeMin, browser, node, browserTests]
