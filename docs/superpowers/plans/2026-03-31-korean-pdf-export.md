# Korean PDF Export Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a print/export mode that renders the Korean deck as a complete PDF-friendly document with fixed 1920 × 1080 slide pages and generate the resulting PDF file.

**Architecture:** Detect export intent from the query string in `App.tsx`, switch slide rendering from single-active fullscreen mode to all-slides-visible flow mode, and use CSS to convert those visible slides into fixed-size 16:9 print pages. Keep export behavior isolated so the existing interactive deck remains unchanged.

**Tech Stack:** React 19, Vite, TypeScript, Vitest, CSS print media rules

---

## Chunk 1: Test and App Logic

### Task 1: Add a failing export-mode shell test

**Files:**
- Modify: `src/App.test.tsx`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing test**

Add a test that loads `"/kr?export=pdf"` and expects both mocked Korean slides to render while the navigation buttons and slide counter are absent.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because the current app still renders only one active slide and keeps deck chrome visible.

- [ ] **Step 3: Write minimal implementation**

Update `src/App.tsx` to detect export mode, mark every slide visible when exporting, pass `isActive: true` for export rendering, and skip rendering progress/navigation chrome.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS

## Chunk 2: Export Layout Styling

### Task 2: Fix export geometry to 1920 × 1080

**Files:**
- Modify: `style.css`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Add export-mode selectors**

Introduce selectors for an export deck container and export slide state that remove absolute positioning, stack slides vertically, keep content visible, and size each slide to `1920px × 1080px`.

- [ ] **Step 2: Add print pagination rules**

Use `@media print` to force one slide per page, preserve the fixed 16:9 slide size, and avoid padding that changes the intended canvas dimensions.

- [ ] **Step 3: Run targeted tests**

Run: `npm test -- src/App.test.tsx src/App.navigation.test.tsx`
Expected: PASS

## Chunk 3: Verification and PDF Generation

### Task 3: Verify the full app and generate the PDF

**Files:**
- Output: `dist/`
- Output: `artifacts/portfolio-ko.pdf`

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 2: Build the site**

Run: `npm run build`
Expected: PASS and create `dist/`

- [ ] **Step 3: Serve and export**

Serve the built site locally, open `/kr?export=pdf` in a headless browser, and write the PDF to `artifacts/portfolio-ko.pdf`.

- [ ] **Step 4: Sanity check the artifact**

Confirm the PDF file exists and has a non-trivial size.
