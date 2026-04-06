# Footer Navigation Refinement Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tighten the left footer slide-picker sizing and update the right footer so only the current page number is editable while the divider and total stay visible.

**Architecture:** Keep the existing footer interaction states in `App`, but split the right-side counter into independent current/divider/total slots so only the current slot toggles into an input. Apply the compact picker behavior and rotated chevron entirely through targeted markup and CSS refinements rather than reworking the footer layout.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, CSS

---

## Chunk 1: Counter Behavior

### Task 1: Add failing tests for the current-number-only jump input

**Files:**
- Modify: `src/App.navigation.test.tsx`
- Test: `src/App.navigation.test.tsx`

- [ ] **Step 1: Write the failing test**

Add expectations for:
- clicking the current page number opening an inline input
- the slash divider and total page count remaining visible while editing
- submitting the inline input still jumping to the requested slide

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.navigation.test.tsx`
Expected: FAIL because the current implementation swaps the entire `current / total` control into an input.

- [ ] **Step 3: Write minimal implementation**

Update `src/App.tsx` to:
- split the counter into `current`, `/`, and `total` elements
- make only the `current` slot interactive and editable
- preserve the existing submit, blur, cancel, and clamping behavior

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/App.navigation.test.tsx`
Expected: PASS

## Chunk 2: Compact Picker Styling

### Task 2: Refine the slide list sizing and chevron treatment

**Files:**
- Modify: `src/App.tsx`
- Modify: `style.css`

- [ ] **Step 1: Write minimal styling and markup**

Update:
- the left trigger to use a single chevron icon that rotates
- the popover width to fit content up to the viewport cap
- the popover max-height to roughly 4 to 5 visible items with scroll
- the current-page control and inline input to use the underlined inline treatment

- [ ] **Step 2: Run targeted verification**

Run: `npm test -- src/App.navigation.test.tsx`
Expected: PASS after the styling and markup refinement

## Chunk 3: Final Verification

### Task 3: Verify the footer refinement end to end

**Files:**
- Verify: `src/App.tsx`
- Verify: `style.css`
- Verify: `src/App.navigation.test.tsx`

- [ ] **Step 1: Run the targeted suite**

Run: `npm test -- src/App.navigation.test.tsx src/App.test.tsx src/App.demo-interactions.test.tsx`
Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS
