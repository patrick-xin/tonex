# State boundaries — four classes, four homes

The judgment line in each bullet decides the home. Terms → [../../glossary.md](../../glossary.md). _(ADR-0023, on ADR-0017 + ADR-0021)_

- **Portable theme** → `useSource` (`@tonex/core`). *Changes what `deriveTheme` produces:* seed, variant, contrast level, overrides, bindings. _(ADR-0017)_
- **Display preferences** → `useUiPrefs` (`lib/stores/ui-prefs.ts`). *What the user sees in the app, not what the theme produces:* `showExtended`, inspect `colorFormat`, `showTwColorPicker`, `showContrastWarnings`. Surface in the Display popover (`features/nav-tabs/`). _(ADR-0023)_
- **Session state** → future store, filed when the first consumer appears. *Bounds a working context that survives reload but isn't a pref.* _(ADR-0023)_
- **Job parameters** → React-local in the owning feature. *Scoped to one action* (e.g. `ExportOptions` toggles). Never lift to a store, no matter how many surfaces share the shape. _(ADR-0023)_
- **`useUiPrefs` scope-creep guard.** A pref enters only when a *second consumer materially needs it, same intent*. Different intent → two named prefs, not one with override semantics. _(ADR-0023 c.3)_
