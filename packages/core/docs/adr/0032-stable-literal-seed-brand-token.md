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
