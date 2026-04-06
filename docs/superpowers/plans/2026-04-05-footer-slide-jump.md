# Footer Slide Jump Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add direct footer-based slide jumping through a left-side slide list and a right-side page-number input.

**Architecture:** Keep all behavior in `App` so the active slide index remains the single source of truth. Add two small footer-local states for the list popover and page-jump input, then style them in `style.css` and verify the interaction through navigation-focused tests.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, CSS

---

## Chunk 1: Footer Navigation Behavior

### Task 1: Add failing tests for the new footer interactions

**Files:**
- Modify: `src/App.navigation.test.tsx`
- Test: `src/App.navigation.test.tsx`

- [ ] **Step 1: Write the failing test**

Add expectations for:
- clicking the left footer label opening a list of slide titles
- selecting a slide from the list updating the active section label
- clicking the page counter swapping it into an input
- submitting a page number moving to the requested slide
- pressing `Escape` on the page-jump input restoring the counter without navigation

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.navigation.test.tsx`
Expected: FAIL because the footer label and page counter are currently static text.

- [ ] **Step 3: Write minimal implementation**

Update `src/App.tsx` to:
- render the left footer label as a button that toggles a slide-picker popover
- render the page counter as a button that swaps into an inline page-number input
- add helpers that clamp page numbers and close footer UI after navigation

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/App.navigation.test.tsx`
Expected: PASS

## Chunk 2: Footer Styling

### Task 2: Add the new footer UI styles

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Write minimal styling**

Add styles for:
- the left footer trigger button
- the slide-picker popover and slide buttons
- the page counter trigger and inline input
- responsive footer behavior so the new controls remain usable on smaller screens

- [ ] **Step 2: Run targeted verification**

Run: `npm test -- src/App.navigation.test.tsx`
Expected: PASS after the styling changes, confirming selectors and markup stayed intact

## Chunk 3: Final Verification

### Task 3: Verify the footer jump feature without regressions

**Files:**
- Verify: `src/App.tsx`
- Verify: `style.css`
- Verify: `src/App.navigation.test.tsx`

- [ ] **Step 1: Run the targeted navigation suite**

Run: `npm test -- src/App.navigation.test.tsx src/App.test.tsx src/App.demo-interactions.test.tsx`
Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS
