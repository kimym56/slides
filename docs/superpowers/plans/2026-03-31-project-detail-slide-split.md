# Project Detail Slide Split Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split DSSkills and Sellpath detail slides into two consecutive pages each, using the real project images and preserving all existing copy.

**Architecture:** Keep slide ordering and content in `src/deck/slideData.tsx`, but replace the current two-column placeholder detail slides with a small image-detail helper that can render one text block and one image per page. Extend `style.css` with reusable detail image slot styles and per-image modifiers so mismatched asset sizes can be tuned without disturbing other slides.

**Tech Stack:** React, TypeScript, Vite, Vitest, Testing Library, CSS

---

## Chunk 1: Deck Data And Regression Test

### Task 1: Add a failing regression test for the new detail slide sequence

**Files:**
- Create: `src/deck/slideData.test.tsx`
- Modify: `src/deck/slideData.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { slides } from "./slideData";

it("includes split DSSkills and Sellpath detail slides in order", () => {
  expect(slides.map((slide) => slide.title)).toEqual([
    "Portfolio",
    "Introduction",
    "01 — Mimesis",
    "01 — Mimesis Details",
    "01 — Mimesis Details 2",
    "01 — Mimesis Details 3",
    "01 — Mimesis Details 4",
    "02 — DSSkills",
    "02 — DSSkills Details",
    "02 — DSSkills Details 2",
    "03 — Sellpath",
    "03 — Sellpath Details",
    "03 — Sellpath Details 2",
    "Contact",
  ]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/deck/slideData.test.tsx`
Expected: FAIL because the second DSSkills and Sellpath detail slide titles do not exist yet.

- [ ] **Step 3: Write minimal implementation in the deck data**

Update `src/deck/slideData.tsx` to:
- add a reusable helper for image-based detail slides
- replace the current DSSkills detail slide placeholder layout with two consecutive image detail slides
- replace the current Sellpath detail slide placeholder layout with two consecutive image detail slides
- replace the Sellpath overview placeholder with `/images/sellpath_main.png`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/deck/slideData.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/deck/slideData.test.tsx src/deck/slideData.tsx
git commit -m "feat: split project detail slides"
```

## Chunk 2: Layout Styling And Full Verification

### Task 2: Add image detail slide styling and verify the deck

**Files:**
- Modify: `style.css`
- Test: `src/deck/slideData.test.tsx`

- [ ] **Step 1: Write the minimal CSS for image detail slides**

Add:
- a shared detail image slot class using the same card language as existing demo/media slots
- image sizing rules for responsive desktop/mobile behavior
- optional per-image modifier classes for DSSkills and Sellpath assets

- [ ] **Step 2: Run targeted test to confirm no regression**

Run: `npm test -- src/deck/slideData.test.tsx`
Expected: PASS

- [ ] **Step 3: Run the full test suite**

Run: `npm test`
Expected: PASS with zero failing tests

- [ ] **Step 4: Run the production build**

Run: `npm run build`
Expected: PASS with a successful Vite build

- [ ] **Step 5: Commit**

```bash
git add style.css
git commit -m "style: tune project detail image layouts"
```

Plan complete and saved to `docs/superpowers/plans/2026-03-31-project-detail-slide-split.md`. Ready to execute?
