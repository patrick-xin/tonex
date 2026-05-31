> **State:** Living. Edit when www vocabulary changes; definitions only — rules go in `agents/rules/`, the why in the ADR.

## App domain

**Workflow feature**:
A verb-named feature — "what the user does" — layer-agnostic. Lives in `features/<verb>/`, e.g. `token-override/`, `source-color/`, `export/`. Reads `useLayer()` to pick *data*, never to switch components. See ADR-0022.

**Surface feature**:
A noun/place-named feature — "where the user is" — layer-keyed names allowed. Composes workflow features; carries no workflow logic beyond layout/tab-switching. e.g. `md-rail/`, `top-nav/`, `testbed/`. See ADR-0022.

**Chrome**:
The editor shell — rail, top tabs, status strip, modals, settings, layer switcher. Always rendered from `components/ui/` (md primitives) on every route; tonex dogfoods its own md library regardless of output layer. See ADR-0019.

**Canvas**:
The preview surface under `theme/{(md),(shadcn)}/…`, layer-segmented: md canvas → `components/ui/`, shadcn canvas → `components/shadcn/`. A shadcn user sees an md-styled editor with a shadcn-styled canvas. See ADR-0019.

**Layer awareness**:
A workflow feature reads `const layer = useLayer()` from `<LayerContext>` to switch *what data* it renders (`layer === 'shadcn' ? shadcnTokens : mdTokens`), never *which component*. Don't prop-drill layer. See ADR-0019.

**Locate-test**:
The design metric for structure: a prompt "do X to Y" must resolve to exactly one `features/<Y>/` or one `components/` primitive. No home → create the named feature folder before writing code. See ADR-0022.

**Route-content**:
A passive-display view (reads selectors only) that hardcodes layer-specific names and has one consumer — colocated at its route (`page.tsx` inline or a sibling `_<view>.tsx`), NOT promoted to a feature. Contrast with a workflow feature (mutates source) and a shared component (2+ consumers). See ADR-0022.
