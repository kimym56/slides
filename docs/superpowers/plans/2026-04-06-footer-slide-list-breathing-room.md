# Footer Slide List Breathing Room Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the footer slide list intrinsically sized while adding enough horizontal spacing that it no longer feels cramped.

**Architecture:** Leave the existing footer markup alone and adjust only the slide-picker spacing tokens in `style.css`. Add one stylesheet-focused regression test so the intrinsic-width and increased padding rules are preserved.

**Tech Stack:** CSS, Vitest

---

## Chunk 1: Intrinsic Width Spacing

### Task 1: Add a failing CSS regression test for the slide-picker spacing

**Files:**
- Modify: `src/localeFonts.test.ts`
- Test: `src/localeFonts.test.ts`

- [ ] **Step 1: Write the failing test**

Add expectations that:
- `.slide-list-popover` keeps `width: fit-content`
- `.slide-list-popover` still avoids `min-width`
- `.slide-list-popover` uses larger horizontal padding
- `.slide-list-button` uses larger horizontal padding

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/localeFonts.test.ts`
Expected: FAIL because the current spacing is still too tight.

- [ ] **Step 3: Write minimal implementation**

Update `style.css` to:
- keep intrinsic width on the popover
- increase popover horizontal padding
- increase row horizontal padding

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/localeFonts.test.ts`
Expected: PASS

## Chunk 2: Final Verification

### Task 2: Verify the spacing refinement with the existing footer suites

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
