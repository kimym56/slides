# Detail slide readability design

## Summary

Improve the readability of the detail-slide helpers by replacing their dense paragraph stacks with a balanced lead-plus-bullets treatment that uses vertical space more intentionally while preserving the existing two-column slide structure.

## Goals

- Make both image-detail and Mimesis detail slide descriptions easier to scan during a presentation.
- Reduce the visual density caused by stacking every description as equal-weight paragraphs.
- Use the open lower area in the text column more intentionally on desktop layouts.
- Keep the `descriptions` input API unchanged so existing slide declarations stay simple.

## Non-Goals

- Redesigning the overall slide deck visual language.
- Rewriting all project copy into a new content model.
- Introducing new dependencies or a broader component refactor.

## Approved Decisions

- `renderProjectImageDetailSlide` and `renderMimesisDetailSlide` will treat the first `descriptions` item as a short lead line.
- Remaining `descriptions` items will render as a bullet list instead of additional body paragraphs.
- The text column for detail slides will gain its own wrapper so it can be vertically centered against the media on wider screens.
- Both helper signatures stay the same; no caller needs to switch to a new prop structure.
- The copy treatment should be shared instead of duplicated so both detail helpers stay visually aligned.
- Minor copy normalization is allowed only if a first item reads too much like a fragment when elevated to lead text.

## Architecture

The behavior change remains localized to `src/deck/slideData.tsx`. The detail-slide helpers should derive a `leadDescription` and `bulletDescriptions` from the existing `descriptions` array and render them through a shared structured-copy path rather than keeping separate paragraph-based implementations.

Styling remains centralized in `style.css`. The new styles should introduce a shared detail-copy wrapper, a lead style, a custom bullet list, and desktop alignment rules that improve vertical rhythm without affecting the overview slides.

## Testing Strategy

- Add regression tests in `src/deck/slideData.test.tsx` that prove an image-detail slide and a Mimesis detail slide each render one lead line plus a bullet list for the remaining items.
- Run the targeted deck-data test first to establish the red/green cycle.
- Run the targeted test again after implementation.
- Run a production build to verify the updated slide markup and CSS still compile.

## Risks

- Some existing `descriptions` arrays may have first items that read awkwardly when promoted to lead text.
- CSS changes must stay scoped so overview slides do not change accidentally.
- Vertical centering must not cause the text column to feel cramped on shorter viewports.
