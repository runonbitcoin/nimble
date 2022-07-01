function writeDER(writer, signature) {
  const r =
    signature.r[0] & 0x80 ? [0x00].concat(Array.from(signature.r)) : signature.r
  const s =
    signature.s[0] & 0x80 ? [0x00].concat(Array.from(signature.s)) : signature.s
  const rlength = r.length
  const slength = s.length
  const length = 2 + rlength + 2 + slength
  const der = new Uint8Array(length + 2)
  der[0] = 0x30
  der[1] = length
  der[2] = 0x02
  der[3] = rlength
  der.set(r, 4)
  der[rlength + 4] = 0x02
  der[rlength + 5] = slength
  der.set(s, rlength + 6)
  writer.write(der)
}

module.exports = writeDER
