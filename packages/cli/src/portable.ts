// why: the PortableTheme (de)serializer — the by-value `colors.json` seam #219 adds.
// `serialize` writes a derived theme here; `apply` reads one back. Core already owns
// the FORMAT (`PortableThemeSchema` / `parsePortableTheme` / `SCHEMA_VERSION`,
// ADR-0009); this leaf only does the two CLI-side jobs core doesn't: emit canonical,
// stable-ordered text, and wrap core's all-or-nothing parse with CLI-facing error
// copy. No color logic, no schema knowledge beyond the version stamp — a thin,
// testable boundary either side of the engine.
import { type PortableTheme, parsePortableTheme, SCHEMA_VERSION } from '@tonex/core/schema'

// why: canonical = key-sorted recursively, so the same theme always serializes to the
// same bytes regardless of in-memory key order (parseSource builds the object in one
// order, a www export may use another). Stable bytes are what make the round-trip
// identity provable and a future diff meaningful. Arrays keep their order (it is
// semantic — custom-color order is the emission order); only object keys are sorted.
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value !== null && typeof value === 'object') {
    const sorted: Record<string, unknown> = {}
    for (const key of Object.keys(value).sort()) {
      sorted[key] = canonicalize((value as Record<string, unknown>)[key])
    }
    return sorted
  }
  return value
}

// why: the writer — a `PortableTheme` to canonical, version-stamped JSON. The theme
// already carries its `version` field (SCHEMA_VERSION, set by parseSource via
// DEFAULT_INPUTS), so the stamp rides inside the bytes; canonicalize just fixes the
// ordering. No trailing newline — the command adds it at the stdout boundary.
export function serializePortableTheme(theme: PortableTheme): string {
  return JSON.stringify(canonicalize(theme), null, 2)
}

// why: the reader — wrap core's `parsePortableTheme` with the two failure modes the
// CLI must distinguish from a real theme, both exit-2 usage errors (the call/input is
// wrong, not the artifact): malformed JSON, and a shape/range/version mismatch. Core's
// parse is all-or-nothing (ADR-0009) and returns no field detail, so the message names
// the three things that can be wrong and the version we expect — enough for an agent
// to fix the input without a migration ladder (pre-launch, ADR-0009 c.4).
export function loadPortableTheme(
  raw: string,
): { ok: true; theme: PortableTheme } | { ok: false; message: string } {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, message: `tonex: input is not valid JSON\n` }
  }
  const result = parsePortableTheme(parsed)
  if (!result.ok) {
    return {
      ok: false,
      message: `tonex: not a valid PortableTheme — bad shape, out-of-range field, or schema version mismatch (expected version ${SCHEMA_VERSION})\n`,
    }
  }
  return { ok: true, theme: result.theme }
}
