# Footer Navigation Refinement Design

## Summary

Refine the new footer jump UI so the left slide list behaves like a compact content-fit picker and the right footer keeps the existing `< current / total >` structure while making only the current page number editable.

## Goals

- Reduce the left slide list width so it fits its longest visible label rather than using a broad fixed panel.
- Reduce the left slide list height to show roughly 4 to 5 items before scrolling.
- Use one consistent chevron icon for the left trigger and rotate it between closed and open states.
- Keep the right footer layout intact, with only the current page number turning into an underlined inline input.

## Non-Goals

- Changing slide navigation logic, slide ordering, or locale behavior.
- Replacing the previous and next arrow buttons on the right side.
- Introducing a larger modal or full-screen table-of-contents treatment.

## Approved Decisions

- The left popover width will shrink to content using a max-content style cap, bounded by viewport width.
- The left popover height will be reduced to roughly 4 to 5 row heights with vertical scrolling for the remaining slides.
- The left trigger chevron will use the same icon in both states and only rotate.
- The right footer will visually read as `< 3 / 14 >`, with only `3` clickable and editable.
- The editable current page number will use an underlined treatment in both resting and editing states.

## Architecture

`App` will keep the existing footer state model, but the counter markup will be split into separate current-page, divider, and total-page elements so only the current-page slot swaps between display and input states. This keeps navigation behavior centralized while limiting the DOM change to one small part of the footer.

`style.css` will carry most of the refinement work: content-fit sizing for the slide picker, a tighter max-height, a single SVG chevron treatment, and an inline underlined current-page control that preserves the surrounding counter layout.

## File Boundaries

- `src/App.tsx`
  Refine the slide-list trigger icon markup and split the right counter so only the current page number becomes editable.
- `style.css`
  Tighten slide-list sizing, constrain the popover height, rotate a single chevron icon, and restyle the current page number/input inline.
- `src/App.navigation.test.tsx`
  Add coverage that the current page number can be edited without hiding the divider and total count.

## Risks

- Content-fit sizing can overflow on narrow screens unless clamped carefully.
- Swapping only one part of the counter into an input needs consistent alignment to avoid footer jitter.
- Changing the trigger icon from a pseudo-element to explicit markup needs to preserve focus and hover states cleanly.
