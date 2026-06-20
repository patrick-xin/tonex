# the brand token — the literal seed, pinned past MCU's mode and variant flips

shadcn users have no stable, vivid, AA-safe token for their own brand color. The default preset binds the filled `--primary` role to the soft `--color-primary-container` in light mode, so a filled `bg-primary` button reads as the pale container rather than the color the user actually chose; `text-primary` usages fail contrast on light surfaces for the same reason. The one color the user unambiguously picked and unambiguously means as "their brand" — the seed — surfaces nowhere as a directly usable, contrast-safe filled token.

The instinct is to fix this by normalizing the primary binding. That doesn't work, and the reason is structural. MCU assigns the primary / primary-container tones by a rule that depends on both variant and mode: under tonalSpot, light mode reads primary as the vivid brand and primary-container as the soft one, and dark mode flips which is which; cmf, content, and fidelity behave differently again. So "bind brand to whichever role is the vivid one" has no stable answer — the role that reads as brand is not invariant, so a binding onto it can't be invariant either. Any brand token built on MCU roles inherits MCU's mode×variant instability.

**Decision:** emit a brand token that is the literal seed, detached from the MCU role system entirely, plus a foreground computed to be self-sufficiently AA against it. Five commitments.

## 1. Brand is the literal seed, not an MCU-derived role

The brand fill is the seed's own literal value — the exact color the user entered — not any tone MCU computed from it.

**Why:** the seed is the only color in the system the user definitely chose and definitely intends as their brand. Every MCU role is a derivation of the seed at some assigned tone, and that tone is the thing that moves across mode and variant. Pinning brand to the literal seed is the only construction that escapes the flip, because it never consults the role table at all. This is philosophically an override in ADR-0026's sense — a literal pin, not a symbolic role→token binding — and it aligns with ADR-0031's "brand is the seed": presets carry a curated seed; brand is that seed made directly usable.

## 2. The fill is mode-invariant; only the foreground adapts

Brand carries one fill value, identical in light and dark. The paired foreground is what changes to keep the pair legible.

**Why:** a brand color is an identity, not a theme-dependent surface. A logo's color does not become a different color when the page goes dark; expecting it to flip the way MCU roles flip is exactly the failure this token exists to avoid. Contrast still has to hold in both modes, but that is the foreground's job — adapt the on-color, never the brand itself.

## 3. The foreground is computed to clear AA on its own, not borrowed from a role

Brand ships its own foreground, derived to meet AA against the literal seed, rather than reusing the existing on-primary on-color.

**Why:** on-primary tracks the MCU primary role, which is a different color from the literal seed and carries no contrast guarantee against it. A brand pair has to be self-sufficient — usable the moment it is emitted, by someone who knows nothing about the rest of the token system — so its foreground must be guaranteed legible against the brand fill specifically, computed for that purpose and not inherited from a role that happens to be nearby.

## 4. One opt-in switch governs every brand surface — not a per-export toggle

Brand is gated by a single editor setting, default off. When on it governs all three brand surfaces together: the showcase brand button, the brand rows in the contrast audit, and whether the export emits the pair. There is no separate export-dialog toggle.

**Why:** the alternative — mirroring extended's split of a view-pref (`showExtended`) and an independent export option (`includeExtended`) — is justified for extended because it is *many* roles, where "look at these while designing" and "ship these" are genuinely separate choices. Brand is *one* pair. For a single token the two-switch model is ceremony, not control: the honest mental model is "I use a brand color, or I don't," and that is one decision. So the editor setting is the single source of truth, and the export inclusion is wired to it rather than asked again.

The token values are still always derivable and always written to the live DOM as CSS variables — cheap, inert until referenced — so flipping the switch reveals the button and audit rows instantly without a re-derive. The baked first-paint defaults stay byte-stable because the default is off and the baked file is produced by the no-brand path; the preview-equals-export guarantee (ADR-0017) is undisturbed, since preview and export read the same derived pair and the switch only chooses whether that pair surfaces. The contrast audit reflects the same gate — brand pairs are appended to the evaluation only under the switch, so the role-editor surfaces that never asked for brand never see it.

## 5. Primary-binding normalization is out of scope

This token is additive. It does not touch the existing primary / primary-container bindings, and it does not resolve the `text-primary`-on-pale-container contrast problem that motivated the investigation.

**Why:** that problem is the MCU mode×variant flip from the opening — a genuinely harder question about how roles should be routed, with its own trade-offs across every variant. Bundling a routing change into this token would couple a safe, isolated addition to a contested redesign. Brand stands alone and ships independently; normalizing the primary binding remains open and is decided on its own terms when taken up.

---

_amendment 2026-06-19 — the agent-facing surface (the CLI / `colors.json`, ADR-0039) reframes how the literal seed and its foreground reach a consumer. The www editor emits a standing `--brand` / `--brand-foreground` pair behind its opt-in switch (commitments 1–5, unchanged); the agent surface does not. Four decisions settle why, and where the foreground now lives._

## 6. The brand pair is categorically an override, never a role

The brand fill + foreground is a literal pin — an override in ADR-0026's sense — and must never appear in the role roster. It is not role #29; it is not a derivation the role table knows about.

**Why:** commitment 1 already classifies brand as an override, not a symbolic role→token binding. Letting it leak into the role roster would re-import exactly the mode×variant instability the literal pin exists to escape, and would invite a consumer to treat the seed as one more derived role to bind — which it is categorically not.

## 7. The agent surface emits no standing brand token

`colors.json` and the CLI emit no `--brand` token. An agent already holds the seed as its own input — it _is_ the thing the agent passed in — so restating it as an emitted token is redundant at best, and at worst invites treating it as "role #29": a value to bind like the derived roles, which it is not.

**Why:** the www editor needs a standing token because its user picks a color in a GUI and needs it surfaced as a usable variable; the agent never lost the seed in the first place. Re-emitting it adds a token whose only honest meaning is "the input you gave me", and an emitted token reads as a role to bind. The agent surface stays the role set plus the seed-as-input, with no pseudo-role echo.

## 8. The AA-safe foreground is a derivable capability, not a pre-emitted token

For the agent surface, the AA-safe foreground of a literal fill is computed on demand on the contrast surface (`deriveForeground`), not shipped as a standing token. Given any fill, the capability returns the maximum-contrast (or ratio-targeted) on-color.

**Why:** by commitment 7 there is no standing brand token to attach a foreground to. But the _capability_ — "what is the AA-safe on-color for this fill?" — is exactly what a consumer pairing the seed against itself needs, and it is a pure function of the fill and a target ratio. Placing it on the contrast surface (where the WCAG verdict already lives) keeps it usable for any literal fill, not just the seed, and ratio-parameterized so the same pick serves AA, AAA, and large-text. The www editor's standing `--brand-foreground` is now a thin caller of this same capability at ratio 4.5, so the byte-stable value and the agent-surface capability can't diverge.

## 9. The seed-tone dead zone is variant-independent — the override is the only stable home

The reason the literal value needs an override home at all is variant-independent: seeds at roughly tone 51–59 land on neither `primary` nor `primary-container` across every variant family. No variant rescues the seed, so the override is the only construction that surfaces the literal value reliably.

**Why:** one might hope a different variant would route a mid-tone seed onto a directly-usable vivid role, removing the need for the literal pin. It does not. Across CMF (container clamp), content, and fidelity (a ±10 tone-delta pin against the fixed primary), a seed in the T51–59 band is assigned to neither the vivid `primary` nor the soft `primary-container` — the dead zone is structural, not a tonalSpot artifact. Since no variant choice rescues the seed, the literal override (commitments 1–2) is not a tonalSpot workaround but the only stable home for the exact value the user chose.

**Code anchors:** `packages/core/src/theme/contrast/pairs.ts`, `packages/core/src/theme/contrast/contrast.ts`, `packages/core/src/audit/foreground.ts` — stable literal seed brand token + its derivable AA-safe foreground.
