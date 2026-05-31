# Variants — one widened interface

Governs `variants/`.

- **Single widened interface, not a discriminated union.** Don't split into `SingleSourceVariant | TwoSourceVariant`. The optional `secondHct` is the contract until a third two-source variant earns the split. _(ADR-0010)_
- **`derive.ts` is the only variant-name translator.** camelCase → MCU's SCREAMING_SNAKE happens once via the strategy's `mcuVariant` field. Don't sprinkle conversions. _(ADR-0010)_
- **Engine accepts what source says; UI disables invalid combos.** Don't emit runtime warnings for invalid interaction states; prevent the invalid input up-front in UI. _(ADR-0010)_
- **`cmfSecondSourceHex` is a flat field on `PortableTheme`.** Threads through `derive.ts` into `cmf.build`; other variants pass through with `secondHct` unset. _(ADR-0010; per ADR-0006)_
