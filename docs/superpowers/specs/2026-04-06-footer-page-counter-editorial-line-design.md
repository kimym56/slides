# Footer Page Counter Editorial Line Design

**Date:** 2026-04-06

**Goal:** Replace the right footer current-page chip with a quieter editorial line treatment that still reads as interactive and preserves the existing inline edit behavior.

## Decision

The approved direction is the visual companion's `A` option: an editorial line treatment.

## Scope

- Keep the current `current / total` structure in `src/App.tsx`.
- Change only the CSS for the current-page button and inline input in `style.css`.
- Preserve divider and total styling.
- Preserve click-to-edit, blur submit, enter submit, and escape cancel behavior.

## Design

- The current page value should read like inline pagination text, not a pill or chip.
- The idle state uses a light hairline underline and stronger numeral weight.
- The editing state keeps the same footprint but shifts the underline to the accent color.
- The control should stay compact and not add extra visual mass to the right footer.

## Validation

- Add a CSS regression in `src/localeFonts.test.ts` for the editorial-line rules.
- Run the footer navigation test to confirm the interaction behavior remains intact.
