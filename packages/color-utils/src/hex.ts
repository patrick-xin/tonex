// why: 6-digit hex format predicate. Pairs with `hexString(argb)` (oklch.ts)
// which emits the same shape — `isValidHex` is the inverse: does this string
// match what hexString produces? Used at trust boundaries (source-store
// setters, valibot schemas) where a hex literal arrives from outside the
// engine and must be format-checked before reaching MCU's argbFromHex (which
// silently returns garbage on malformed input). Mixed-case accepted to match
// the existing wire convention; canonicalization (lowercasing) is a separate
// concern owned by the emitter.
export function isValidHex(hex: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(hex)
}
