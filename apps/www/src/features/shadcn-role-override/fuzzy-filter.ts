// why: matchSorter's ACRONYM ranking only catches initials of word boundaries
// (`pc` → primary-container) and fails on partials that span boundaries
// (`pric`, `prico`, `onter`). For our token namespace (`primary-container`,
// `on-tertiary-container`, etc.) users naturally type fragments that cross
// hyphens. Subsequence match on the separator-stripped string is what they
// expect.
const normalize = (s: string): string => s.replace(/[-_\s]/g, '').toLowerCase()

export function fuzzyMatches(label: string, query: string): boolean {
  const trimmed = query.trim()
  if (trimmed === '') return true
  const haystack = normalize(label)
  const needle = normalize(trimmed)
  let qi = 0
  for (let i = 0; i < haystack.length && qi < needle.length; i++) {
    if (haystack[i] === needle[qi]) qi++
  }
  return qi === needle.length
}
