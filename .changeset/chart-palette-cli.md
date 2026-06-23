---
"tonex": minor
---

Add `--chart-palette` to `generate` and `serialize` — pick the chart series palette in the web app's own vocabulary (`single` | `multi` | `polychrome`). It implies `--with-chart` (sets the chart axis and emits the `--chart-1..5` block), and `describe.chart` lists the taxonomy so an agent maps intent → palette with no skill-doc dependency. The label↔config mapping lives in `@tonex/core` and is shared with the web UI toggle, so a GUI choice round-trips to a pasteable command.
