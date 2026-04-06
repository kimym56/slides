# Footer Slide List Padding Tune Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the footer slide-list spacing with better padding while keeping intrinsic sizing.

**Architecture:** Keep the current popover structure and intrinsic width rules. Change only the padding values in `style.css` and update the CSS regression test in `src/localeFonts.test.ts`.

**Tech Stack:** CSS, Vitest

---

## Chunk 1: Padding Values

### Task 1: Update the CSS regression test first

**Files:**
- Modify: `src/localeFonts.test.ts`
- Test: `src/localeFonts.test.ts`

- [ ] **Step 1: Write the failing test**

Update expectations for:
- `.slide-list-popover` padding to `0.5rem 0.75rem`
- `.slide-list-button` padding to `0.7rem 1.1rem`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/localeFonts.test.ts`
Expected: FAIL because the stylesheet still uses the previous spacing values.

- [ ] **Step 3: Write minimal implementation**

Update `style.css` with the approved padding values.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/localeFonts.test.ts`
Expected: PASS

## Chunk 2: Final Verification

### Task 2: Verify the refinement against the footer suite and full app

**Files:**
- Verify: `style.css`
- Verify: `src/localeFonts.test.ts`

- [ ] **Step 1: Run the targeted suite**

Run: `npm test -- src/localeFonts.test.ts src/App.navigation.test.tsx`
Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS
