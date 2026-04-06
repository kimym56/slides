# Footer Slide Jump Design

## Summary

Upgrade the fixed footer navigation so the left footer label opens a slide-picker list and the right page counter becomes an inline page-jump input when clicked.

## Goals

- Let users open a compact list of all slides from the left footer label.
- Let users jump directly to a slide by clicking the page counter and typing a page number.
- Keep the existing arrow-button navigation and keyboard/wheel navigation intact.
- Preserve the current deck chrome style while adding clearly interactive footer affordances.

## Non-Goals

- Replacing the footer layout or adding a full-screen table-of-contents view.
- Changing slide order, titles, or locale behavior.
- Adding route-based deep links per slide.

## Approved Decisions

- Clicking the left footer label opens a popover list of every slide title with its page number.
- Selecting an item in the list immediately moves to that slide and closes the popover.
- Clicking the `current / total` counter swaps it into a text input for a 1-based page number.
- The page-jump input submits on `Enter` and on blur, cancels on `Escape`, and clamps entered values into the valid slide range.

## Architecture

`App` remains the source of truth for the active slide index and owns both new footer interaction states: whether the slide-picker popover is open and whether the page-jump input is active. The new controls stay local to the footer chrome because they only orchestrate `currentSlide` updates and do not affect slide rendering contracts.

The slide-picker uses the existing `slides` array so titles and page counts stay in sync automatically for both locales. Footer interaction state is reset after successful navigation so the deck never leaves stale overlays or inputs open after a jump.

## File Boundaries

- `src/App.tsx`
  Add footer popover and inline page-jump state, handlers, and accessible interactive controls.
- `style.css`
  Add interactive footer styling for the left-label button, slide-picker popover, page-jump trigger, and inline input.
- `src/App.navigation.test.tsx`
  Add behavior coverage for opening the slide-picker, jumping from the list, and using the inline page-jump input.

## Risks

- Footer overlays sit inside a fixed chrome layer, so pointer-events need to stay scoped carefully.
- The page-jump input must not leak keyboard events to the document-level slide navigation handler.
- The slide-picker must remain usable on narrower viewports without covering the whole footer or becoming hard to dismiss.
