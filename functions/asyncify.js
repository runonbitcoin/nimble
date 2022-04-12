// Asyncify-ing a function does not improve the overall performance - it makes it little worse -
// but it allows the js runtime to take breaks to handle other tasks between calls.
function asyncify (f) {
  if (!f) return null
  return async (...args) => await f(...args)
}

module.exports = asyncify
