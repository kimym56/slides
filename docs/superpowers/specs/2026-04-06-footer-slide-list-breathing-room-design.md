# Footer Slide List Breathing Room Design

## Summary

Relax the left footer slide-picker so it still uses intrinsic sizing without a fixed width, but no longer feels cramped around the text.

## Goals

- Keep the slide list content-sized rather than introducing a fixed panel width.
- Add more horizontal breathing room around the slide titles.
- Preserve the existing viewport cap and compact 4 to 5 row height.

## Non-Goals

- Reworking the popover structure or slide-jump behavior.
- Changing the right footer counter interaction.
- Introducing a min-width or fixed width token for the slide-picker.

## Approved Decisions

- The popover keeps intrinsic width.
- Extra space comes from larger horizontal padding on the popover and its list rows.
- The max-height and viewport max-width remain as they are.

## Architecture

This refinement is CSS-only. The existing `App` markup already supports intrinsic sizing, so the change stays in `style.css` with a small regression test that reads the stylesheet and verifies the intended intrinsic-width and spacing rules.

## File Boundaries

- `style.css`
  Increase the slide-picker horizontal spacing while keeping intrinsic width and the current height cap.
- `src/localeFonts.test.ts`
  Add a stylesheet assertion covering the non-fixed-width slide-picker spacing rules.

## Risks

- Too much inner padding could make the popover feel oversized on short titles.
- Changing only spacing means the result still depends on the longest title, so the viewport cap must remain intact.
