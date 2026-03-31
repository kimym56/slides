# Deck Korean Locale Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Korean deck mode that renders whenever the pathname ends with `/kr`, while keeping English as the default for every other path.

**Architecture:** Keep the slide layout and demo rendering shared, but make slide data locale-aware through a typed `Locale` input. Detect locale in `App`, localize deck chrome there, and use test-first changes so both the shell and slide content switch consistently between English and Korean.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library

---

## Chunk 1: Locale Detection And Deck Shell

### Task 1: Add failing tests for route-based locale detection in the app shell

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.navigation.test.tsx`
- Test: `src/App.test.tsx`
- Test: `src/App.navigation.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("renders Korean deck chrome when pathname ends with /kr", () => {
  window.history.replaceState({}, "", "/kr");
  render(<App />);
  expect(screen.getByLabelText("이전 슬라이드")).toBeInTheDocument();
  expect(screen.getByText("다음")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx src/App.navigation.test.tsx`
Expected: FAIL because `App` still imports a fixed English `slides` array and does not localize shell labels from the pathname.

- [ ] **Step 3: Write minimal implementation**

```tsx
type Locale = "en" | "ko";

function getLocaleFromPathname(pathname: string): Locale {
  const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return normalized.endsWith("/kr") ? "ko" : "en";
}
```

Update `App` to:
- derive locale from `window.location.pathname`
- call `getSlides(locale)`
- localize nav button `aria-label`s and keyboard help copy
- set `document.documentElement.lang`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx src/App.navigation.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/App.navigation.test.tsx
git commit -m "feat: add route-based deck locale switching"
```

## Chunk 2: Localized Slide Data

### Task 2: Add failing tests for localized slide titles and translated content

**Files:**
- Modify: `src/deck/slideData.test.tsx`
- Modify: `src/deck/slideData.tsx`
- Test: `src/deck/slideData.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
it("returns Korean slide titles and translated copy for the Korean locale", () => {
  const slides = getSlides("ko");
  expect(slides[0]?.title).toBe("포트폴리오");
  render(<>{slides[3]?.render({ isActive: false })}</>);
  expect(screen.getByText(/iBooks와 Apple Maps/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/deck/slideData.test.tsx`
Expected: FAIL because `getSlides("ko")` does not exist yet and only English inline copy is available.

- [ ] **Step 3: Write minimal implementation**

Create a typed locale content model inside `src/deck/slideData.tsx`:

```ts
type Locale = "en" | "ko";

export function getSlides(locale: Locale): SlideDefinition[] {
  const copy = deckCopy[locale];
  return [
    { id: "slide-1", title: copy.slides.portfolio.title, render: () => ... },
  ];
}
```

Implementation rules:
- keep existing render helper functions
- localize all user-facing strings, including alt text and contact labels
- preserve slide IDs, media paths, links, and layout classes
- avoid duplicating full render logic per locale

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/deck/slideData.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/deck/slideData.tsx src/deck/slideData.test.tsx
git commit -m "feat: localize deck slide content for Korean"
```

## Chunk 3: Full Verification

### Task 3: Verify the complete deck behavior stays green

**Files:**
- Verify: `src/App.tsx`
- Verify: `src/deck/slideData.tsx`
- Verify: `src/App.test.tsx`
- Verify: `src/App.navigation.test.tsx`
- Verify: `src/deck/slideData.test.tsx`

- [ ] **Step 1: Run the targeted locale test set**

Run: `npm test -- src/App.test.tsx src/App.navigation.test.tsx src/deck/slideData.test.tsx`
Expected: PASS

- [ ] **Step 2: Run the full test suite**

Run: `npm test`
Expected: PASS

- [ ] **Step 3: Run a production build**

Run: `npm run build`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/App.test.tsx src/App.navigation.test.tsx src/deck/slideData.tsx src/deck/slideData.test.tsx
git commit -m "test: verify deck locale support"
```

## Notes

- Use `@test-driven-development` for each behavior change before touching implementation.
- Use `@vercel-react-best-practices` while updating React components to keep state and effects minimal.
- Use `@verification-before-completion` before claiming the feature is complete.
