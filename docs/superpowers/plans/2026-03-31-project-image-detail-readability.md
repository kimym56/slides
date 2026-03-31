# Detail Slide Readability Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the detail-slide helpers by rendering a short lead plus bullet list and aligning the copy column more intentionally beside the image or demo.

**Architecture:** Keep the slide declarations in `src/deck/slideData.tsx` unchanged at the call site by deriving lead and bullet content inside a shared structured-copy path used by both detail helpers. Extend `style.css` with shared detail-copy layout classes so the new treatment stays isolated from the deck overview slides while applying consistently to both image and demo detail slides.

**Tech Stack:** React, TypeScript, Vitest, Testing Library, CSS, Vite

---

## Chunk 1: Regression Test And Helper Markup

### Task 1: Add failing regression tests for detail-slide copy structure

**Files:**
- Modify: `src/deck/slideData.test.tsx`
- Modify: `src/deck/slideData.tsx`

- [ ] **Step 1: Write the failing test**

Add tests that render an image-detail slide such as `slide-12` and a Mimesis detail slide such as `slide-4`, and assert:
- the detail title renders
- the first description is rendered as a dedicated lead element
- the remaining descriptions render as list items inside a details list

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/deck/slideData.test.tsx`
Expected: FAIL because at least one helper still renders every description as `.details-text` paragraphs.

- [ ] **Step 3: Write minimal helper implementation**

Update `src/deck/slideData.tsx` to:
- split `descriptions` into a first-item lead and remaining bullet content
- render both detail helpers through a shared structured-copy wrapper
- preserve the existing `descriptions` prop shape for all slide declarations

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/deck/slideData.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/deck/slideData.test.tsx src/deck/slideData.tsx
git commit -m "feat: improve project image detail readability"
```

## Chunk 2: Styling And Verification

### Task 2: Add shared detail-slide layout styles and verify the deck

**Files:**
- Modify: `style.css`
- Test: `src/deck/slideData.test.tsx`

- [ ] **Step 1: Add image-detail-specific styles**

Add:
- a copy wrapper class for structured detail slides
- a lead text style distinct from `.details-text`
- a custom bullet list style with better spacing
- a desktop alignment rule that centers the copy column against the media while preserving mobile stacking

- [ ] **Step 2: Run the targeted regression test**

Run: `npm test -- src/deck/slideData.test.tsx`
Expected: PASS

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS with a successful Vite build

- [ ] **Step 4: Review the diff for scope**

Confirm the change is limited to:
- `src/deck/slideData.tsx`
- `src/deck/slideData.test.tsx`
- `style.css`
- the new spec and plan docs

- [ ] **Step 5: Commit**

```bash
git add style.css docs/superpowers/specs/2026-03-31-project-image-detail-readability-design.md docs/superpowers/plans/2026-03-31-project-image-detail-readability.md
git commit -m "style: rebalance project image detail slides"
```

Plan complete and saved to `docs/superpowers/plans/2026-03-31-project-image-detail-readability.md`. Ready to execute?
