// why: the AA-safe foreground for an ARBITRARY literal fill — a leaf capability on
// the contrast surface. A literal fill (a brand seed, a user-pasted swatch) doesn't
// follow MCU's per-mode tonal flip, so one foreground is picked for max contrast
// against it. MD3-style: a hue-matched near-white / near-black (tinted toward the
// fill's hue at low chroma) rather than flat #fff/#000 — but only if the tint still
// clears the requested ratio; otherwise fall back to the pure extreme on that side,
// which is the MAXIMUM achievable contrast there. Every fill clears 4.5:1 from the
// better extreme (worst case ~4.58:1), so AA is always reachable; only a raised ratio
// (AAA 7:1) leaves a mid-tone fill short — this returns the best pick, never throws.
// Generalized from derive's private brandForeground (ADR-0032): the literal `4.5`
// becomes a ratio knob so the CLI can ask for AAA/large. Depends only on @tonex/color-utils
// (Hct via @tonex/mcu) — NOT on derive, so the contrast surface stays cycle-free.
// argb in, argb out: the firewall holds, encoding happens at the format/CLI seam.
import { argbFromHex, contrastRatio } from '@tonex/color-utils'
import { Hct } from '@tonex/mcu'

const FG_TINT_CHROMA = 8
const FG_LIGHT_TONE = 98
const FG_DARK_TONE = 12
const AA_TEXT_RATIO = 4.5
const FG_WHITE = argbFromHex('#ffffff')
const FG_BLACK = argbFromHex('#000000')

export interface DeriveForegroundOptions {
  /** the contrast ratio the foreground must clear before the tint is kept (default 4.5, WCAG AA text). */
  ratio?: number
}

// why: pick the max-contrast side (white vs black) against the fill, build the
// hue-tinted near-white/near-black at that side's tone (chroma capped at 8); if the
// tint clears `ratio`, keep it; else fall back to that side's pure extreme — the
// maximum achievable contrast on that side. At a raised ratio (AAA 7:1) a mid-tone
// fill reaches neither side's target; we still return the better extreme rather than throw.
export function deriveForeground(fillArgb: number, opts: DeriveForegroundOptions = {}): number {
  const ratio = opts.ratio ?? AA_TEXT_RATIO
  const fill = Hct.fromInt(fillArgb)
  const goLight = contrastRatio(FG_WHITE, fillArgb) >= contrastRatio(FG_BLACK, fillArgb)
  const tone = goLight ? FG_LIGHT_TONE : FG_DARK_TONE
  const tinted = Hct.from(fill.hue, Math.min(fill.chroma, FG_TINT_CHROMA), tone).toInt()
  if (contrastRatio(tinted, fillArgb) >= ratio) return tinted
  return goLight ? FG_WHITE : FG_BLACK
}
