class BufferReader {
  constructor (buffer, pos = 0) {
    this.buffer = buffer
    this.pos = pos
  }

  read (length) {
    this.checkRemaining(length)

    const start = this.pos
    const end = start + length
    const buffer = this.buffer.slice(start, end)
    this.pos = end

    return buffer
  }

  close () {
    if (this.pos !== this.buffer.length) throw new Error('unconsumed data')
  }

  checkRemaining (length) {
    if (this.buffer.length - this.pos < length) throw new Error('not enough data')
  }
}

module.exports = BufferReader
