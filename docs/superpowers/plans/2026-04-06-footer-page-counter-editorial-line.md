# Footer Page Counter Editorial Line Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle the right footer current-page control as a quieter editorial line while preserving inline edit behavior.

**Architecture:** Keep the existing footer markup and interaction logic in `src/App.tsx` unchanged. Constrain the work to a CSS regression in `src/localeFonts.test.ts` and a targeted style update in `style.css` so the current page value and inline input share the same compact editorial treatment.

**Tech Stack:** React 19, TypeScript, Vitest, CSS

---

## Chunk 1: Editorial Counter Style

### Task 1: Update the right footer current-page treatment

**Files:**
- Modify: `src/localeFonts.test.ts`
- Modify: `style.css`
- Verify: `src/App.navigation.test.tsx`

- [ ] **Step 1: Write the failing test**

Add CSS assertions in `src/localeFonts.test.ts` that require:
- the current-page button to keep its compact height but use the editorial-line padding
- the current-page button to use no full border and a light bottom rule
- the edit input to use the accent-colored bottom rule instead of the capsule border

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/localeFonts.test.ts`
Expected: FAIL because the current CSS still uses the capsule treatment.

- [ ] **Step 3: Write minimal implementation**

Update `style.css` so:
- `.slide-counter-trigger` returns to a text-like inline control with a subtle bottom rule
- `.page-jump-input` matches that footprint and uses the accent rule while editing
- hover and focus remain legible without reintroducing the heavier capsule treatment

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test -- src/localeFonts.test.ts src/App.navigation.test.tsx`
Expected: PASS
