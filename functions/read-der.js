function readDER (reader) {
  const [prefix, length, rprefix, rlength] = reader.read(4)
  const r = reader.read(rlength)
  const [sprefix, slength] = reader.read(2)
  const s = reader.read(slength)

  if (prefix !== 0x30 || rprefix !== 0x02 || sprefix !== 0x02 || length !== rlength + slength + 4 || r[0] & 0x80 || s[0] & 0x80) {
    throw new Error('bad der')
  }

  return { r: r[0] === 0 ? r.slice(1) : r, s: s[0] === 0 ? s.slice(1) : s }
}

module.exports = readDER
