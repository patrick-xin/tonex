# tonex — Feature Brief for Copywriters

> **Purpose of this doc.** This is raw material for marketing copy, not finished copy. It explains — in plain language — what tonex does and why each feature matters, so you can write landing-page sections without needing to know our tech stack. Every feature below includes a draft headline, the promise in one line, a plain-English explanation, the pain it removes, proof points, and notes on what to lean into (or avoid).
>
> Pick the 4–6 that tell the strongest story. There are 6 core features plus 3 supporting blocks you can mix in.

---

## First, the 30-second orientation

**What is tonex?**
You give it one color — your brand color. It instantly turns that single color into a complete, polished set of colors for an entire app or website: backgrounds, buttons, text, highlights, charts, warnings — everything. And it does it in a way that's guaranteed to look harmonious and stay readable.

**The one-sentence version:** *One color in, a whole design system out.*

**Who it's for:**
- **Designers** who have a brand color and need a full, professional palette without hand-picking dozens of shades.
- **Developers** building an app who want to drop in a coherent color system and move on.
- **Teams** who ship across more than one platform (a website *and* a mobile app, say) and want a single, consistent look everywhere.

**The mood / personality:** Confident, precise, a little bit "pro tool." Not playful or cutesy. The user is someone who cares about getting this right.

---

## A tiny glossary (so the copy stays accurate)

You don't need to be technical, but a few words appear a lot. Here's what they actually mean:

- **Seed** — the one starting color the user picks. Everything is built from it. (You can call it "your brand color," "your one color," or "your starting color" in copy.)
- **Theme / palette / color system** — the full set of colors tonex builds from the seed. Use whichever word reads best.
- **Light mode / dark mode** — the two looks every modern app has: a bright version and a dark version. Users switch between them.
- **Material Design** and **shadcn** — these are two of the most widely used toolkits that designers and developers use to build app interfaces. Think of them as two different "design languages." Most color tools only speak one. tonex speaks both. (In copy aimed at our audience, you can name them directly — our users know these names. For your own understanding: they're just two popular standards.)
- **Surface** — the background areas of an interface (cards, panels, page backgrounds).
- **Token** — one named color slot in the system (e.g. "button color," "warning color"). You almost never need this word in copy; say "every color" instead.

---

# THE SIX CORE FEATURES

---

## 1. One color in, a whole design system out

**Draft headlines (pick a direction):**
- "Start with one color. Get an entire system."
- "Your brand color, multiplied into a full palette."
- "From a single color to a complete, coherent design system — in seconds."

**The promise in one line:**
Pick one color and watch a complete, harmonious palette build itself around it.

**Plain-English explanation:**
Building a color system by hand is slow and fiddly. You pick a brand color, then you need a lighter version, a darker version, a background, a text color, a hover color, an error color — dozens of decisions, each one a chance to make the whole thing look slightly off. tonex does all of that from your one color, instantly. You choose a color; it returns a finished, professional palette where every shade belongs.

**The pain it removes:**
Hours of manually sampling, nudging, and second-guessing shades — replaced by a few seconds.

**Proof points to weave in:**
- It's instant — change the color, the entire system updates live in front of you.
- The result is *coherent*: nothing looks bolted on, because every color descends from the same source.
- You can start from an **image** — drop in a logo or photo and tonex pulls a color out of it. *(Verified live in the app.)*
- Power users can also dial a color in by precise hue / intensity / brightness — but most people just pick or paste one.

**Lean into:** the magic-moment feeling — one input, a whole world out. This is the hook; it's the reason someone tries the product.

---

## 2. One source, two design languages

**Draft headlines:**
- "Build for two design systems at once. From one color."
- "Ship to Material Design and shadcn — from a single source."
- "One palette. Two ecosystems. Zero double work."

**The promise in one line:**
Generate a matching theme for both major design standards at the same time, from the same starting color.

**Plain-English explanation:**
Most teams eventually build for more than one place — a website built one way, a mobile app another. Normally that means recreating the color system twice, in two different tools, and praying they end up looking the same. tonex generates **both** versions from your single starting color — a Material Design theme and a shadcn theme — each ready to export. You work from one color and walk away with both, instead of running two tools that drift apart.

**The pain it removes:**
Maintaining two separate color systems that are supposed to match but never quite do.

**Proof points to weave in:**
- Both themes are built from the same starting color, so they share one identity.
- Both are fully exportable — you're never locked into a single ecosystem.
- This is genuinely rare: most color tools pick a side. tonex does both.
- ⚠️ **Wording caution:** the literal phrase *"edit once, export both"* needs a product confirm — in the app today the two systems are tuned in their own views. The safe, verified claim is *"both themes, from one color."* See Accuracy flags.

**Lean into:** *both design systems from one color.* This is our most *distinctive* positioning — almost nobody else does it. If you only emphasize one differentiator, consider this one. (Hold the exact "edit once" phrasing pending the product confirm in Accuracy flags.)

**Avoid:** getting lost in what Material Design vs shadcn technically are. The benefit is "you don't do the work twice."

---

## 3. What you see is exactly what you ship

**Draft headlines:**
- "What you preview is what you ship. Exactly."
- "No surprises between the screen and the real thing."
- "The preview isn't a promise. It's the product."

**The promise in one line:**
The colors you see while designing are precisely the colors that end up in your finished product — down to the last detail.

**Plain-English explanation:**
Here's a frustration anyone who's used a color tool knows: you perfect your palette in the tool, you move it into your real project — and the colors come out *slightly different*. A little duller. A little off. tonex is built so that can't happen. The preview you tune and the final output you take away are the exact same thing. No drift, no "wait, that's not the color I picked."

**The pain it removes:**
The gap between "looked great in the tool" and "looks wrong in the actual app."

**Proof points to weave in:**
- Byte-for-byte identical: what's on screen is what you take with you.
- This is a known trap that competing tools fall into — and a reason people stop trusting them. We engineered it out.

**Lean into:** *trust*. This is the credibility feature. It says "we sweat the details so you can rely on us." Pairs beautifully with feature 2 (because consistency only matters if it's accurate).

---

## 4. Light and dark, designed as a pair

**Draft headlines:**
- "Light mode and dark mode — born together, perfectly matched."
- "Dark mode isn't an afterthought. It's half the design."
- "One color. Two flawless modes."

**The promise in one line:**
Get a beautiful light version and a beautiful dark version at the same time, each tuned correctly — not one bright theme awkwardly inverted.

**Plain-English explanation:**
Almost every app today needs both a light look and a dark look. Usually the dark version is an afterthought — someone flips the colors at the end and hopes for the best, which is why so many dark modes feel muddy or harsh. tonex builds both modes together, from your one color, each carefully balanced for how it'll actually be seen. Flip between them and the whole system holds up. Both feel intentional, because both *are*.

**The pain it removes:**
The dreaded "now we have to redo everything for dark mode" — and the disappointing results when teams rush it.

**Proof points to weave in:**
- Both modes come from the same color, so your identity stays intact whichever one the user prefers.
- Toggle between them live and watch the system stay coherent.
- You can fine-tune light and dark **separately** — so neither one is a compromise. *(Verified: independent per-mode controls in the app.)*

**Lean into:** the idea that you get two complete, correct themes for the effort of zero. Dark mode "for free" and done *right*.

---

## 5. Beautiful colors, guaranteed readable

**Draft headlines:**
- "Colors that always stay readable — guaranteed by the math, not your eyes."
- "Harmony and legibility, built in. Not hoped for."
- "Every color pairing, checked. So your text is always readable."

**The promise in one line:**
Every combination of colors is automatically checked so text stays legible and the palette stays harmonious — you never have to eyeball it.

**Plain-English explanation:**
Two problems sink most homemade palettes: colors that clash, and text you can't read against its background. tonex is built on a respected color science (the same kind of perceptual math behind major design standards) that keeps every shade in tune with the others — so the palette is harmonious by construction, not by luck. On top of that, it automatically checks every text-and-background pairing against accessibility standards, so you can see at a glance what's comfortably readable. Good-looking *and* readable stops being a manual chore.

**The pain it removes:**
Manually checking contrast, squinting at "is this readable enough?", and discovering accessibility problems after launch.

**Proof points to weave in:**
- Built on perceptual color science — the palette is harmonious by design.
- A built-in **contrast checker** rates color pairings at a glance — clear pass / warn / fail marks against accessibility (WCAG) standards. *(Verified: a real tool in the app.)*
- You can even export accessibility-tuned contrast levels (standard, medium, high) for stricter needs.
- Accessibility isn't a separate step you bolt on later; it's native to every theme.

**Lean into:** the reassurance angle — "you literally cannot make an unreadable mess by accident." Good for designers who care, and for teams with accessibility requirements.

---

## 6. Total control that never breaks the harmony

**Draft headlines:**
- "Fine-tune anything. Break nothing."
- "Lock what you love. Adjust everything else."
- "Pro controls, with guardrails baked in."

**The promise in one line:**
Tweak the palette as deeply as you want — pin exact colors, adjust the mood, dial the intensity — and it stays coherent no matter what.

**Plain-English explanation:**
The instant palette is the starting point, not a cage. Lock your exact brand color so it never moves while you experiment around it. Pin any individual color to a precise value. Choose from a range of moods — from calm and neutral to bold and expressive. Make backgrounds cleanly neutral or gently tinted with your brand. Add your own extra colors and they'll automatically tune themselves to fit the rest. Dial light and dark to taste, separately. The whole time, tonex keeps everything in harmony — so you get the control of doing it by hand with none of the risk of breaking the look. And if you'd rather not fiddle, start from one of our ready-made, hand-crafted starting points and go.

**The pain it removes:**
Having to choose between "easy but generic" and "custom but fragile." Here you get both: deep control *and* a system that can't fall apart.

**Proof points to weave in:**
- Lock your brand color and explore freely around it.
- Pin specific colors; choose from ~10 distinct moods; adjust contrast and background treatment.
- Add custom colors of your own that auto-harmonize with the system.
- Ready-made starting points (a handful of curated presets) for people who'd rather not start from scratch.
- Reset any control back to default at any time.

**Lean into:** empowerment with a safety net. This feature reassures the power user ("yes, you can get into the details") and the casual user ("you won't break it") at the same time.

---

# SUPPORTING FEATURES (use as smaller blocks or fold into the above)

---

## A. Take it anywhere you build

**Draft headline:** "Copy, paste, ship. In whatever you're building with."

**Plain-English:** When you're done, tonex hands you your color system ready to drop straight into your project — copy it or download it. It exports for the web (Tailwind and plain CSS), for mobile apps (Flutter/Dart), as structured data (JSON), as a ready-to-use shadcn setup, and even as a clean design-spec document for your team. No reformatting, no manual conversion. And because of feature 3, what you take away matches what you saw, exactly. *(Export formats verified live in the app.)*

**Why it matters:** the finish line is frictionless. The work ends the moment you copy.

---

## B. One identity, on every surface

**Draft headline:** "Your brand, consistent everywhere it appears."

**Plain-English:** Send the same theme to your marketing site, your dashboard, your mobile app, and your docs. Because it all flows from one color, your identity looks the same in every place a customer meets you — no patchwork, no drift between channels.

**Why it matters:** brand consistency without policing it by hand. (Note: overlaps with features 1 and 2 — use this as a closing line or a visual section rather than a standalone pillar, to avoid repeating yourself.)

---

## C. Real components, not color swatches

**Draft headline:** "See your palette on real interfaces before you commit."

**Plain-English:** Instead of staring at abstract color squares, you preview your theme on actual app pieces — login screens, dashboards, charts, buttons, cards. You see how it really feels in use, light mode and dark, before you ship a thing.

**Why it matters:** confidence. You're judging the real result, not guessing from swatches.

---

## D. Bring your own colors — they'll fit right in

**Draft headline:** "Add your own colors. They harmonize automatically."

**Plain-English:** The system isn't limited to what's generated for you. Add any extra color you need — a special highlight, a category color, a seasonal accent — and tonex gently tunes it so it sits naturally beside everything else, in both light and dark. Your additions never look pasted in from somewhere else.

**Why it matters:** flexibility without fragmenting the look. *(Verified: a custom-colors feature with an auto-harmonize option.)*

---

## E. Built for speed

**Draft headline:** "Everything a keystroke away."

**Plain-English:** tonex is built to move fast. A quick command menu and keyboard shortcuts put every action — switch modes, export, check contrast — one key away, and a short guided tour gets first-timers oriented in seconds. It feels less like a settings page and more like a pro instrument.

**Why it matters:** speaks to serious users who live in their tools; reinforces the "pro-grade" personality. *(Verified: command menu, keyboard shortcuts, and an onboarding tour ship today.)*

---

# Voice & tone cheat sheet

- **Confident and precise**, not hypey. Our user is a professional. Short, active sentences.
- **Lead with the outcome**, not the mechanism. "A whole system from one color," not "perceptual tonal palette derivation."
- **Recurring theme words that are working today:** *coherent, one seed / one color, one identity, holds, exactly, never drift.* Keep this vocabulary alive — it's already the product's voice.
- **It's okay to name Material Design and shadcn** in customer-facing copy — our audience knows them. Just don't make the copy *about* them; make it about what the user gets.
- **Avoid:** the words "token," "HCT," "derivation," "engine." They're accurate internally but mean nothing to a reader. Translate every one.

---

# ⚠️ Accuracy flags — resolved & open

These were checked against the live app. Status below.

**RESOLVED — safe to use:**
1. **Image color extraction is real.** You *can* drop in a logo or photo and tonex extracts a color from it. Feature 1 now states this confidently (earlier doubt cleared).
2. **Export formats are real and reachable.** Confirmed in the app: Tailwind, plain CSS, JSON, Flutter/Dart, a shadcn setup, and a design-spec document. Name these freely.
3. **The contrast checker is a real, built-in tool** (feature 5) — not just a background promise. Pass / warn / fail marks are shown in-app.

**OPEN — confirm with the product team before publishing:**
4. **"Edit once, export both" (feature 2) — wording needs a confirm.** The app generates both a Material Design theme and a shadcn theme from one color, and both export — that *outcome* is solid and distinctive. But the two are currently tuned in **separate views**, so a literal promise of a single shared editing session ("change it once, both update") may overstate today's flow. Use *"both themes, from one color"*; clear any stronger phrasing with the team first.
5. **No accounts, saving, sharing, or collaboration today.** The flow is: create → export the code → you keep it. There's no login, no cloud-saved projects, no share links, and edits aren't retained after a page refresh. **Don't imply** saved projects, teams, or "access your themes anywhere."
6. **Presets are a curated handful (~9), currently centered on the shadcn side.** If you cite a number, confirm the current count first.

When in doubt, describe the *benefit* (stable) rather than the exact *spec* (still moving).
