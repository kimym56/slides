# Korean PDF Export Design

## Summary

Add a dedicated export mode that renders the existing Korean slide deck as a print-friendly document, then use that mode to generate a PDF without changing the interactive presentation behavior. The export pages must use a fixed 16:9 slide canvas sized to 1920 × 1080.

## Goals

- Export the current `/kr` deck to a PDF as-is.
- Keep the normal interactive deck unchanged for `/` and `/kr`.
- Render every slide in export mode so browser print captures the full deck.
- Hide interactive-only chrome in export mode and in printed output.

## Non-Goals

- Rewriting Korean copy.
- Adding a new routing system.
- Building a general presentation export pipeline with multiple formats.
- Redesigning slide layouts for print beyond what is required for reliable pagination and a fixed 16:9 slide canvas.

## Approved Decisions

- Trigger export mode with a query param on the existing route: `/kr?export=pdf`.
- Keep locale detection path-based and export detection query-based.
- In export mode, render all slides as visible stacked pages instead of a single active slide.
- Use print CSS to force one slide per page and suppress navigation/progress chrome.
- Size each export slide to a fixed `1920px × 1080px` canvas so the PDF matches the deck aspect ratio.

## Architecture

`App` remains the source of truth for locale detection and slide data, but it also checks the current query string for export mode. When export mode is active, it bypasses active-slide navigation state for rendering and instead marks every slide as visible and renderable.

The print/export behavior stays in CSS. The base interactive styles continue to control fullscreen presentation, while a small export layer switches the deck container to a vertical flow, removes absolute positioning, and applies page-break behavior for browser PDF generation. Export slides use an explicit 1920 × 1080 box so the PDF output behaves like a slide deck rather than a paper document.

## File Boundaries

- `src/App.tsx`
  Detect export mode, render all slides in export layout, and hide deck chrome when exporting.
- `src/App.test.tsx`
  Verify export mode renders all slides and removes interactive chrome.
- `style.css`
  Add export and `@media print` styles so slides paginate cleanly.

## Behavior Rules

- `/kr` remains the normal interactive Korean deck.
- `/kr?export=pdf` renders the Korean deck in export mode.
- Export mode shows every slide in order.
- Export mode hides progress and slider navigation.
- Export mode still passes `isActive: true` into slide renderers so demos and images mount for capture.
- Each export page uses a fixed 16:9 `1920px × 1080px` slide area with no extra print padding changing that aspect ratio.

## Testing Strategy

- Keep the existing React-shell export test to protect the export route behavior.
- Implement the CSS-only geometry change to use a fixed 1920 × 1080 export canvas.
- Run the full Vitest suite after implementation.

## Risks

- Some interactive demos may be heavy when all slides mount at once, but this is acceptable for one-off export mode.
- Browser PDF engines can vary slightly in pagination, so the CSS should avoid relying on implicit page breaks.
