const decodeScriptChunks = require('./decode-script-chunks')
const encodeScriptChunks = require('./encode-script-chunks')

const OP_CODESEPARATOR = 171

function subscript (script, n) {
  if (!Number.isInteger(parseInt(n)) || n < 0) throw new Error('invalid number')

  try {
    const scriptChunks = decodeScriptChunks(script)

    let index = 0;

    for (let i = 0; i < scriptChunks.length; ++i) {
      if (scriptChunks[i].opcode === OP_CODESEPARATOR) {
        if (index === n){
            return encodeScriptChunks(scriptChunks.slice(i + 1))
        } else {
          ++index;
        }
      }
    }
  } catch (err) {
    throw new Error(`couldn't get the subscript: ${err}`)
  }
    
  return script
}

module.exports = subscript
