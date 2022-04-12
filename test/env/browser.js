/**
 * Runs the tests in a live browser using Selenium.
 *
 * The appropriate webdriver must be installed.
 *
 * Usage:
 *    node ./browser.js [spec..]
 *
 * Environment variables:
 *    BROWSER=<chrome|firefox|safari|MicrosoftEdge>       (Default: chrome)
 *    TIMEOUT=<milliseconds>                              (Default: 300000)
 */

const path = require('path')
const webpack = require('webpack')
const webdriver = require('selenium-webdriver')
const firefox = require('selenium-webdriver/firefox')
const chrome = require('selenium-webdriver/chrome')
const edge = require('selenium-webdriver/edge')

// ------------------------------------------------------------------------------------------------
// buildTests
// ------------------------------------------------------------------------------------------------

async function buildTests () {
  if (process.argv.length > 2) process.env.SPECS = JSON.stringify(process.argv.slice(2))
  process.env.MANGLED = 1
  const compiler = webpack(require('../../webpack.config'))
  return new Promise((resolve, reject) => compiler.run(e => e ? reject(e) : resolve()))
}

// ------------------------------------------------------------------------------------------------
// runTests
// ------------------------------------------------------------------------------------------------

async function runTests () {
  const timeout = process.env.TIMEOUT || 10 * 60 * 1000
  const browser = process.env.BROWSER || 'chrome'

  // Headless mode is required in Linux VMs on Github Actions
  const chromeOptions = new chrome.Options().headless()
  const firefoxOptions = new firefox.Options().headless()
  const edgeOptions = new edge.Options().headless()

  // Start the browser
  const driver = await new webdriver.Builder()
    .setChromeOptions(chromeOptions)
    .setFirefoxOptions(firefoxOptions)
    .setEdgeOptions(edgeOptions)
    .forBrowser(browser)
    .build()

  // Bump up the script timeout to reduce warnings in executeScript below
  const timeouts = await driver.manage().getTimeouts()
  timeouts.script = 90 * 1000
  await driver.manage().setTimeouts(timeouts)

  // Poll function to read logs
  async function poll () {
    let done = false

    try {
      done = (await driver.executeScript('return { done }')).done
    } catch (e) {
      console.warn('Error polling done:', e)
    }

    try {
      const logs = await driver.executeScript('return pollLogs()')
      for (const log of logs) console.log(...log)
    } catch (e) {
      console.warn('Error reading logs:', e)
    }

    return !done
  }

  let failures = 0

  try {
    // Load the test page
    const url = `file://${path.resolve(__dirname, 'browser.html?colors=1')}`
    await driver.get(url)

    // Poll until complete or timeout
    const startTime = new Date()
    const timedOut = () => (new Date() - startTime > timeout)
    while (!timedOut() && await poll());

    // Read the number of failures
    failures = await driver.executeScript('return failures')
  } finally {
    await driver.quit()
  }

  // Exit with the failure count as the exit code. 0 failures = success
  process.exit(failures)
}

// ------------------------------------------------------------------------------------------------
// main
// ------------------------------------------------------------------------------------------------

function error (e) {
  console.error(e)
  process.exit(1)
}

const testing = typeof global.it !== 'undefined'
if (!testing) buildTests().then(runTests).catch(error)

// ------------------------------------------------------------------------------------------------
