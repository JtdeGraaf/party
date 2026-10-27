import { encode } from 'uqr'

/** A QR code as one SVG path of dark squares, `size` squares wide, without the quiet border around it. */
export type QrCode = { size: number; path: string }

export function qrCodeFor(text: string): QrCode {
  const { data, size } = encode(text, { ecc: 'M', border: 0 })
  const squares = data.flatMap((row, y) => row.flatMap((dark, x) => (dark ? [`M${x} ${y}h1v1h-1z`] : [])))
  return { size, path: squares.join('') }
}
