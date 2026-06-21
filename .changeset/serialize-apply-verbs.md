---
"tonex": minor
---

Add `tonex serialize` and `tonex apply` — the by-value `colors.json` round-trip. `serialize` freezes a derived theme into a canonical, version-stamped `PortableTheme`; `apply` loads one (file or stdin) and projects it (`--to`) or gates it (`--check`), honoring every pin/binding/override in the file. `serialize | apply --to T` reproduces `generate --to T` exactly.
