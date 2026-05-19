> **State:** Living rationale. Edit body when reality overtakes prose; the decision and rationale don't change without a new ADR.

# MCU is the fixed color engine

This tool's wedge is Material Color Utilities (MCU): one seed → multiple well-conditioned palettes (HCT/CAM16, accessibility-aware) across distinct moods.

**Decision:** MCU is the only color engine. There is no `ColorEngine` slot. Alternate generators (Radix-as-engine, custom palette algorithms) are out of scope. A user who doesn't want MCU-generated colors is not in our audience.

**Why:** Swapping the engine dilutes the differentiator. Adding an engine slot makes "MCU vs other" a user-facing choice, which would force the UI to abstract over engine differences and lose the live mood-shift demo that's the actual pitch.

**Consequence:** "Add Radix" can only mean "add Radix as a palette library" (see ADR-0004), never "add Radix as an engine."
