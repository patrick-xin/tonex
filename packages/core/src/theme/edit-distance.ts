// why: the levenshtein routine + a nearest-name pick shared by every token
// did-you-mean (contrast `--pairs`, `adjust --shifts`). One implementation, but
// each caller supplies its OWN vocabulary — the suggestion domain differs by
// command (pairs spans md ∪ shadcn, adjust is md-only), so the SET stays at the
// call site while only the distance math is shared. Same cap (< 3) the flag
// parser uses, so an unrelated token is never suggested.
export function editDistance(a: string, b: string): number {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const tmp = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return row[b.length]
}

// why: the nearest name in `vocabulary` to `token` within the edit-distance cap,
// or undefined when nothing is close enough. Callers pass the vocabulary that is
// VALID for them, so the suggestion can never name a token the command rejects.
export function nearestName(token: string, vocabulary: Iterable<string>): string | undefined {
  let best: string | undefined
  let bestDist = 3
  for (const name of vocabulary) {
    const d = editDistance(token, name)
    if (d < bestDist) {
      bestDist = d
      best = name
    }
  }
  return best
}
