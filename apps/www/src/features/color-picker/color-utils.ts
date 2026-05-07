// hex ↔ HSVA color math + helpers used internally by the color picker.
// adapted from react-colorful (MIT, Vlad Shilov), trimmed to hex-only paths.

export interface HsvaColor {
  h: number
  s: number
  v: number
  a: number
}

interface RgbaColor {
  r: number
  g: number
  b: number
  a: number
}

interface HslaColor {
  h: number
  s: number
  l: number
  a: number
}

export const clamp = (n: number, min = 0, max = 1): number => {
  return n > max ? max : n < min ? min : n
}

export const round = (n: number, digits = 0, base = 10 ** digits): number => {
  return Math.round(base * n) / base
}

export const hexToRgba = (hex: string): RgbaColor => {
  const clean = hex[0] === '#' ? hex.substring(1) : hex
  if (clean.length < 6) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
      a: clean.length === 4 ? round(parseInt(clean[3] + clean[3], 16) / 255, 2) : 1,
    }
  }
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
    a: clean.length === 8 ? round(parseInt(clean.substring(6, 8), 16) / 255, 2) : 1,
  }
}

export const rgbaToHsva = ({ r, g, b, a }: RgbaColor): HsvaColor => {
  const max = Math.max(r, g, b)
  const delta = max - Math.min(r, g, b)
  const hh = delta
    ? max === r
      ? (g - b) / delta
      : max === g
        ? 2 + (b - r) / delta
        : 4 + (r - g) / delta
    : 0
  return {
    h: round(60 * (hh < 0 ? hh + 6 : hh)),
    s: round(max ? (delta / max) * 100 : 0),
    v: round((max / 255) * 100),
    a,
  }
}

export const hexToHsva = (hex: string): HsvaColor => rgbaToHsva(hexToRgba(hex))

export const hsvaToRgba = ({ h, s, v, a }: HsvaColor): RgbaColor => {
  const hh0 = (h / 360) * 6
  const ss = s / 100
  const vv = v / 100
  const hh = Math.floor(hh0)
  const b = vv * (1 - ss)
  const c = vv * (1 - (hh0 - hh) * ss)
  const d = vv * (1 - (1 - hh0 + hh) * ss)
  const module = hh % 6
  return {
    r: round([vv, c, b, b, d, vv][module] * 255),
    g: round([d, vv, vv, c, b, b][module] * 255),
    b: round([b, b, d, vv, vv, c][module] * 255),
    a: round(a, 2),
  }
}

const formatByte = (n: number) => {
  const hex = n.toString(16)
  return hex.length < 2 ? `0${hex}` : hex
}

export const rgbaToHex = ({ r, g, b }: RgbaColor): string => {
  return `#${formatByte(r)}${formatByte(g)}${formatByte(b)}`
}

export const hsvaToHex = (hsva: HsvaColor): string => rgbaToHex(hsvaToRgba(hsva))

const hsvaToHsla = ({ h, s, v, a }: HsvaColor): HslaColor => {
  const hh = ((200 - s) * v) / 100
  return {
    h: round(h),
    s: round(hh > 0 && hh < 200 ? ((s * v) / 100 / (hh <= 100 ? hh : 200 - hh)) * 100 : 0),
    l: round(hh / 2),
    a: round(a, 2),
  }
}

export const hsvaToHslString = (hsva: HsvaColor): string => {
  const { h, s, l } = hsvaToHsla(hsva)
  return `hsl(${h}, ${s}%, ${l}%)`
}

export const equalHex = (first: string, second: string): boolean => {
  if (first.toLowerCase() === second.toLowerCase()) return true
  const a = hexToRgba(first)
  const b = hexToRgba(second)
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a
}

export const equalHsva = (first: HsvaColor, second: HsvaColor): boolean => {
  return (
    first.h === second.h && first.s === second.s && first.v === second.v && first.a === second.a
  )
}
