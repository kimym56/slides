# Hero Title Wordmark Spacing Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the first-slide hero title text with locale-specific wordmark markup so the English and Korean cover titles can use optically even spacing.

**Architecture:** Keep the change isolated to the first slide by rendering the hero title through a small locale-aware helper in `src/deck/slideData.tsx`. Style the resulting character spans in `style.css` with minimal pair-specific spacing rules, and lock the behavior down with tests that verify both the markup contract and the hero typography CSS.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library, CSS

---

## Chunk 1: First-Slide Markup Contract

### Task 1: Add failing tests for the locale-specific hero wordmark

**Files:**
- Modify: `src/deck/slideData.test.tsx`
- Test: `src/deck/slideData.test.tsx`

- [ ] **Step 1: Write the failing test**

Add coverage that:
- the English first slide renders the hero title as wrapped character spans rather than one plain text node
- the Korean first slide does the same
- both wordmarks stay inside `h1.hero-title`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/deck/slideData.test.tsx`
Expected: FAIL because the current implementation renders `copy.portfolio.heroTitle` directly as plain text.

- [ ] **Step 3: Write minimal implementation**

Update `src/deck/slideData.tsx` to:
- add a helper that returns locale-specific wordmark markup for the first slide
- render `Portfolio` and `포트폴리오` as character spans with stable class names
- keep the rest of the slide unchanged

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/deck/slideData.test.tsx`
Expected: PASS

## Chunk 2: Hero Wordmark Styling

### Task 2: Add pair-specific spacing rules for the first-slide wordmark

**Files:**
- Modify: `style.css`
- Modify: `src/localeFonts.test.ts`
- Test: `src/localeFonts.test.ts`

- [ ] **Step 1: Write the failing CSS regression**

Update `src/localeFonts.test.ts` so it expects:
- a hero wordmark wrapper class
- explicit per-character display rules
- locale-specific pair spacing selectors

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/localeFonts.test.ts`
Expected: FAIL because the current hero title still uses only the base `h1.hero-title` typography rule.

- [ ] **Step 3: Write minimal styling**

Update `style.css` to:
- preserve the current hero title scale and centering
- add a wordmark wrapper with inline-flex or inline-block character spans
- add only the small set of English and Korean spacing rules needed for visual balance

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/localeFonts.test.ts`
Expected: PASS

## Chunk 3: Final Verification

### Task 3: Verify the wordmark change end to end

**Files:**
- Verify: `src/deck/slideData.tsx`
- Verify: `style.css`
- Verify: `src/deck/slideData.test.tsx`
- Verify: `src/localeFonts.test.ts`

- [ ] **Step 1: Run the focused suites**

Run: `npm test -- src/deck/slideData.test.tsx src/localeFonts.test.ts`
Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS
