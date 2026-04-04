# Deck Locale Entry And Link Sync Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the deck to canonical `/en` and `/kr` locale entries, remove the standalone interactive-link slide, upgrade linked overview and reference styling, and sync the Korean and English slide content structure.

**Architecture:** Keep the deck as a single React SPA with shared slide layouts. Use an early `index.html` redirect for `/`, a defensive locale fallback in `App`, and typed copy in `deckCopy` so both locales share the same slide order and render logic while still allowing locale-specific wording.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library

---

## Chunk 1: Locale Entry Routing

### Task 1: Add failing tests for canonical locale paths and browser-language redirect behavior

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.navigation.test.tsx`
- Modify: `src/viteConfig.test.ts`
- Test: `src/App.test.tsx`
- Test: `src/App.navigation.test.tsx`
- Test: `src/viteConfig.test.ts`

- [ ] **Step 1: Write the failing test**

Add expectations for:
- `/en` rendering English deck chrome
- `/kr` rendering Korean deck chrome
- `/` resolving to `/en` or `/kr` from browser language detection
- static build output emitting both `dist/en/index.html` and `dist/kr/index.html`

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx src/App.navigation.test.tsx src/viteConfig.test.ts`
Expected: FAIL because the app still treats `/` as English, does not recognize `/en` explicitly, and only emits a static `/kr` entry.

- [ ] **Step 3: Write minimal implementation**

Update:
- `index.html` to redirect `/` using browser language detection before hydration
- `src/App.tsx` to resolve `en`/`ko` from `/en` and `/kr`, with a defensive fallback redirect
- `vite.config.ts` to emit both `/en` and `/kr` static HTML entries

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx src/App.navigation.test.tsx src/viteConfig.test.ts`
Expected: PASS

## Chunk 2: Slide Structure And Copy

### Task 2: Add failing tests for the new slide order, linked project subtitles, and synced locale content

**Files:**
- Modify: `src/deck/slideData.test.tsx`
- Modify: `src/App.demo-interactions.test.tsx`
- Modify: `src/App.mimesis.test.tsx`
- Test: `src/deck/slideData.test.tsx`
- Test: `src/App.demo-interactions.test.tsx`
- Test: `src/App.mimesis.test.tsx`

- [ ] **Step 1: Write the failing test**

Add expectations for:
- the interactive-link slide being removed from both locales
- overview slides rendering linked project URLs
- locale toggle links appearing on the first slide
- shifted navigation targets after slide removal
- Korean detail copy rendering without the removed manual line-break fragments

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/deck/slideData.test.tsx src/App.demo-interactions.test.tsx src/App.mimesis.test.tsx`
Expected: FAIL because slide order, overview subtitle rendering, and first-slide controls still use the previous structure.

- [ ] **Step 3: Write minimal implementation**

Update:
- `src/deck/deckCopy.tsx` to remove interactive-link copy, add project URLs, and clean up Korean text
- `src/deck/slideData.tsx` to remove the old slide 2 and render overview project URLs as real links
- `src/App.tsx` to render the first-slide locale toggle

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/deck/slideData.test.tsx src/App.demo-interactions.test.tsx src/App.mimesis.test.tsx`
Expected: PASS

## Chunk 3: Styling And Final Verification

### Task 3: Add failing tests for the updated locale shell and complete the CSS/UI sync

**Files:**
- Modify: `style.css`
- Modify: `src/localeFonts.test.ts`
- Modify: `src/vercelConfig.test.ts`
- Test: `src/localeFonts.test.ts`
- Test: `src/vercelConfig.test.ts`

- [ ] **Step 1: Write the failing test**

Add assertions for:
- `/en` handling in the shell and config language logic
- CSS classes/selectors supporting the locale toggle and custom reference-link styling
- tests/documentation wording no longer assuming `/` is the English deck

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/localeFonts.test.ts src/vercelConfig.test.ts`
Expected: FAIL because the CSS and wording still reflect the previous locale-entry model.

- [ ] **Step 3: Write minimal implementation**

Update `style.css` with:
- first-slide locale-toggle positioning and active/inactive styling
- linked overview subtitle styling
- custom inline reference-link styling for detail slides
- stronger first-slide and introduction text treatment
- Korean-friendly wrapping rules for paragraphs and list items

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/localeFonts.test.ts src/vercelConfig.test.ts`
Expected: PASS

## Chunk 4: Full Verification

### Task 4: Verify the complete deck behavior end to end

**Files:**
- Verify: `index.html`
- Verify: `src/App.tsx`
- Verify: `src/deck/deckCopy.tsx`
- Verify: `src/deck/slideData.tsx`
- Verify: `style.css`
- Verify: `vite.config.ts`

- [ ] **Step 1: Run the targeted suite**

Run: `npm test -- src/App.test.tsx src/App.navigation.test.tsx src/App.demo-interactions.test.tsx src/App.mimesis.test.tsx src/deck/slideData.test.tsx src/viteConfig.test.ts src/localeFonts.test.ts src/vercelConfig.test.ts`
Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run the production build**

Run: `npm run build`
Expected: PASS
