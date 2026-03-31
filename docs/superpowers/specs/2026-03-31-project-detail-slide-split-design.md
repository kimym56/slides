# Project Detail Slide Split Design

## Summary

Split the DSSkills and Sellpath detail slides into two consecutive slides each, matching the one-detail-per-page rhythm already used by Mimesis slides 4 through 7.

## Goals

- Convert DSSkills details from one two-column slide into two slides.
- Convert Sellpath details from one two-column slide into two slides.
- Replace placeholder boxes with the real project images already present in `public/images`.
- Keep the existing copy unchanged.
- Adjust layout styling so each image can be sized independently.

## Non-Goals

- Rewriting project descriptions or titles.
- Refactoring the overall deck architecture.
- Changing the Mimesis slide behavior.

## Approved Decisions

- DSSkills detail content will become two consecutive slides:
  - Prompt Engineering + `/images/dsskills_detail1.png`
  - Validation Sandbox + `/images/dsskills_detail2.png`
- Sellpath detail content will become two consecutive slides:
  - Data Visualization + `/images/sellpath_detail1.png`
  - Backend Integration + `/images/sellpath_detail2.png`
- The overview slides continue using `/images/dsskills_main.png` and `/images/sellpath_main.png`.
- Contact remains the last slide and shifts later in the deck after the two new detail pages are inserted.
- Image wrappers may use per-slide modifier classes so different image aspect ratios can be aligned without affecting the rest of the deck.

## Architecture

The slide sequence remains defined in `src/deck/slideData.tsx`. The implementation should add a reusable helper for image-based detail slides, similar in spirit to the existing Mimesis detail slide helper, so each detail page is declared with concise metadata instead of ad hoc placeholder markup.

Styling remains centralized in `style.css`. The new helper should use a shared image slot class plus optional modifier classes for project-specific sizing and alignment.

## Assets

- `/images/dsskills_main.png`
- `/images/dsskills_detail1.png`
- `/images/dsskills_detail2.png`
- `/images/sellpath_main.png`
- `/images/sellpath_detail1.png`
- `/images/sellpath_detail2.png`

## Testing Strategy

- Add or update a deck data test that asserts the new slide titles and order.
- Run the targeted test first to establish the red/green cycle.
- Run the full test suite after implementation.
- Run a production build to confirm the deck still compiles with the extra slides and image layout changes.
