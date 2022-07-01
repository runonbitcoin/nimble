class BufferWriter {
  constructor() {
    this.buffers = []
    this.length = 0
  }

  write(buffer) {
    this.buffers.push(buffer)
    this.length += buffer.length
    return this
  }

  toBuffer() {
    if (this.buffers.length === 1) {
      return this.buffers[0]
    }

    const whole = new Uint8Array(this.length)

    let offset = 0
    this.buffers.forEach((part) => {
      whole.set(part, offset)
      offset += part.length
    })

    return whole
  }
}

module.exports = BufferWriter
