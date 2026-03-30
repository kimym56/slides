# Mimesis React Slide Integration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four Mimesis `iframe` embeds in `slides` with direct React mounts of the real Mimesis implementations, each locked to a single initial mode.

**Architecture:** Convert `slides` into a React + TypeScript Vite app, keep the deck shell and navigation logic local to `slides`, and consume the four Mimesis project components through slide-specific adapter components. Mirror the small set of required Mimesis public assets into `slides`, mount heavy demos only on active slides, and guard deck navigation so demo interactions do not trigger slide changes.

**Tech Stack:** React 19, Vite, TypeScript, Vitest, Testing Library, Framer Motion, React Three Fiber, Three.js

---

## File Structure

Preserve existing custom edits in `index.html` and `style.css`. Do not replace either file wholesale. Merge carefully, because the current `slides` worktree already contains local changes.

### Core files in `slides`

- Modify: `package.json`
- Modify: `index.html`
- Modify: `style.css`
- Delete: `main.js`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `scripts/sync-mimesis-assets.mjs`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/deck/slideData.tsx`
- Create: `src/test/setup.ts`
- Create: `src/App.test.tsx`
- Create: `src/App.navigation.test.tsx`
- Create: `src/App.mimesis.test.tsx`
- Create: `src/App.demo-interactions.test.tsx`
- Create: `src/mimesis/MimesisDemoFrame.tsx`
- Create: `src/mimesis/PageCurlSlideDemo.tsx`
- Create: `src/mimesis/WiperTypographySlideDemo.tsx`
- Create: `src/mimesis/BwCircleSlideDemo.tsx`
- Create: `src/mimesis/StaggeredTextSlideDemo.tsx`
- Create: `src/mimesis/MimesisAdapters.test.tsx`

### Asset targets in `slides/public`

- Create or sync: `public/images/love-jones-cover.jpg`
- Create or sync: `public/models/tesla_2018_model_3.glb`

### External source consumed from sibling repo

- Read from: `../mimesis/src/projects/page-curl/PageCurlProject.tsx`
- Read from: `../mimesis/src/projects/wiper-typography/WiperTypographyProject.tsx`
- Read from: `../mimesis/src/projects/bw-circle/BwCircleProject.tsx`
- Read from: `../mimesis/src/projects/staggered-text/StaggeredTextProject.tsx`

Use path-specific commits, or a temporary index if needed, so unrelated staged changes already present in `slides` do not get committed accidentally.

## Chunk 1: React Foundation

### Task 1: Replace the static entry point with a tested React shell

**Files:**
- Modify: `package.json`
- Modify: `index.html`
- Delete: `main.js`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/deck/slideData.tsx`
- Create: `src/test/setup.ts`
- Test: `src/App.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render, screen } from "@testing-library/react";
import App from "./App";

it("renders the first slide and deck chrome from the React shell", () => {
  render(<App />);

  expect(screen.getByRole("heading", { name: "Portfolio" })).toBeInTheDocument();
  expect(screen.getByText("1 / 7")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.test.tsx`
Expected: FAIL because `src/App.tsx` and the React test setup do not exist yet.

- [ ] **Step 3: Write the minimal implementation**

Add React, React DOM, TypeScript, `@vitejs/plugin-react`, Vitest, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/user-event`.

Create the Vite React foundation:

```ts
// vite.config.ts
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
  resolve: {
    alias: {
      "@slides": path.resolve(__dirname, "./src"),
    },
  },
});
```

```tsx
// src/main.tsx
import ReactDOM from "react-dom/client";
import App from "./App";
import "../style.css";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
```

```tsx
// src/App.tsx
import { useState } from "react";
import { slides } from "./deck/slideData";

export default function App() {
  const [currentSlide] = useState(0);
  return (
    <>
      {slides.map((slide, index) => (
        <section
          key={slide.id}
          className={`slide ${index === currentSlide ? "active" : ""}`}
          data-title={slide.title}
          id={slide.id}
        >
          {slide.render({ isActive: index === currentSlide })}
        </section>
      ))}
      <div>{currentSlide + 1} / {slides.length}</div>
    </>
  );
}
```

Update `index.html` to mount `<div id="root"></div>` and point its module entry at `/src/main.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/App.test.tsx`
Expected: PASS with one test green and no missing React entry errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json index.html tsconfig.json vite.config.ts src/main.tsx src/App.tsx src/deck/slideData.tsx src/test/setup.ts src/App.test.tsx
git commit -m "build: migrate slides to a React shell"
```

### Task 2: Recreate the current deck navigation and static slide content in React

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/deck/slideData.tsx`
- Modify: `style.css`
- Test: `src/App.navigation.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

it("advances and rewinds slides with keyboard and updates the section label", () => {
  render(<App />);

  fireEvent.keyDown(document, { key: "ArrowRight" });
  expect(screen.getByText("Introduction")).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowLeft" });
  expect(screen.getByText("Portfolio")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.navigation.test.tsx`
Expected: FAIL because the current React shell has no deck navigation behavior yet.

- [ ] **Step 3: Write the minimal implementation**

Move the current slide content from `index.html` into `src/deck/slideData.tsx` and preserve the current classes so `style.css` remains the main visual source of truth.

Implement the deck behavior in `src/App.tsx`:

```tsx
const [currentSlide, setCurrentSlide] = useState(0);

useEffect(() => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight" || event.key === " " || event.code === "Space") {
      setCurrentSlide((current) => Math.min(current + 1, slides.length - 1));
    }
    if (event.key === "ArrowLeft") {
      setCurrentSlide((current) => Math.max(current - 1, 0));
    }
  };

  document.addEventListener("keydown", onKeyDown);
  return () => document.removeEventListener("keydown", onKeyDown);
}, []);
```

Retain the current counter, section label, progress indicator, and previous/next controls in React rather than relying on the old DOM query code from `main.js`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/App.navigation.test.tsx`
Expected: PASS and the existing hero/about/project slides still render with the current layout classes.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/deck/slideData.tsx style.css src/App.navigation.test.tsx
git commit -m "feat: migrate deck navigation to React"
```

## Chunk 2: Mimesis Bridge

### Task 3: Add the cross-project Mimesis bridge, fixed-mode adapters, and asset sync

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `vite.config.ts`
- Create: `scripts/sync-mimesis-assets.mjs`
- Create: `src/mimesis/MimesisDemoFrame.tsx`
- Create: `src/mimesis/PageCurlSlideDemo.tsx`
- Create: `src/mimesis/WiperTypographySlideDemo.tsx`
- Create: `src/mimesis/BwCircleSlideDemo.tsx`
- Create: `src/mimesis/StaggeredTextSlideDemo.tsx`
- Test: `src/mimesis/MimesisAdapters.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { render } from "@testing-library/react";
import { vi } from "vitest";
import PageCurlSlideDemo from "./PageCurlSlideDemo";

const pageCurlSpy = vi.fn(() => <div>page curl</div>);

vi.mock("@mimesis/projects/page-curl/PageCurlProject", () => ({
  default: pageCurlSpy,
}));

it("locks the page curl slide demo to its approved embed mode", () => {
  render(<PageCurlSlideDemo />);

  expect(pageCurlSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      hideControls: true,
      initialMode: "3d",
      projectId: "ios-curl-animation",
    }),
    undefined,
  );
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/mimesis/MimesisAdapters.test.tsx`
Expected: FAIL because there is no `@mimesis` bridge or adapter component yet.

- [ ] **Step 3: Write the minimal implementation**

Install the runtime dependencies actually needed by the imported Mimesis demos:

```bash
npm install react react-dom framer-motion @react-three/fiber @react-three/drei three lil-gui realtime-bpm-analyzer
npm install -D @types/react @types/react-dom @types/three
```

Expose a clean alias for sibling-source imports and allow Vite to read outside the repo root:

```ts
// vite.config.ts
resolve: {
  alias: {
    "@slides": path.resolve(__dirname, "./src"),
    "@mimesis": path.resolve(__dirname, "../mimesis/src"),
  },
},
server: {
  fs: {
    allow: [path.resolve(__dirname, "..")],
  },
},
define: {
  "process.env.NODE_ENV": JSON.stringify("production"),
},
```

Use `"production"` intentionally for `process.env.NODE_ENV` in `slides` so the imported demos stay in presentation mode and do not open `lil-gui` tuning panels in local deck development.

Create a narrow adapter layer:

```tsx
// src/mimesis/PageCurlSlideDemo.tsx
import PageCurlProject from "@mimesis/projects/page-curl/PageCurlProject";
import MimesisDemoFrame from "./MimesisDemoFrame";

export default function PageCurlSlideDemo() {
  return (
    <MimesisDemoFrame>
      <PageCurlProject
        hideControls
        initialMode="3d"
        projectId="ios-curl-animation"
      />
    </MimesisDemoFrame>
  );
}
```

Create `scripts/sync-mimesis-assets.mjs` to copy only the required assets before `dev` and `build`:

```js
const assetMap = [
  ["../mimesis/public/images/love-jones-cover.jpg", "public/images/love-jones-cover.jpg"],
  ["../mimesis/public/models/tesla_2018_model_3.glb", "public/models/tesla_2018_model_3.glb"],
];
```

Wire it into `package.json`:

```json
{
  "scripts": {
    "sync:mimesis-assets": "node scripts/sync-mimesis-assets.mjs",
    "dev": "npm run sync:mimesis-assets && vite",
    "build": "npm run sync:mimesis-assets && vite build",
    "test": "vitest run"
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/mimesis/MimesisAdapters.test.tsx`
Expected: PASS with each adapter asserting the correct `projectId`, fixed `initialMode`, and `hideControls`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts scripts/sync-mimesis-assets.mjs src/mimesis/MimesisDemoFrame.tsx src/mimesis/PageCurlSlideDemo.tsx src/mimesis/WiperTypographySlideDemo.tsx src/mimesis/BwCircleSlideDemo.tsx src/mimesis/StaggeredTextSlideDemo.tsx src/mimesis/MimesisAdapters.test.tsx
git commit -m "feat: add mimesis slide adapters"
```

### Task 4: Replace the iframe slides with direct demo mounts and active-only rendering

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/deck/slideData.tsx`
- Modify: `style.css`
- Test: `src/App.mimesis.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

vi.mock("./mimesis/PageCurlSlideDemo", () => ({ default: () => <div>page-curl-demo</div> }));
vi.mock("./mimesis/WiperTypographySlideDemo", () => ({ default: () => <div>wiper-demo</div> }));
vi.mock("./mimesis/BwCircleSlideDemo", () => ({ default: () => <div>bw-demo</div> }));
vi.mock("./mimesis/StaggeredTextSlideDemo", () => ({ default: () => <div>staggered-demo</div> }));

it("renders mimesis demos in-slide and mounts them only when their slide is active", () => {
  render(<App />);

  expect(document.querySelector("iframe")).toBeNull();
  expect(screen.queryByText("page-curl-demo")).not.toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });

  expect(screen.getByText("page-curl-demo")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.mimesis.test.tsx`
Expected: FAIL because the React slide content still mirrors the old iframe placeholders.

- [ ] **Step 3: Write the minimal implementation**

Update the Mimesis detail slide definitions in `src/deck/slideData.tsx` so the demo cells render the adapters instead of `iframe` tags. Pass `isActive` down from `App` and mount the heavy demos only for the active slide.

Use a render contract like this:

```tsx
render({ isActive }) {
  return (
    <div className="project-demo-frame">
      {isActive ? <PageCurlSlideDemo /> : null}
    </div>
  );
}
```

In `style.css`, replace the `iframe`-specific selectors with a container class that styles React content instead:

```css
.project-demo-frame {
  position: relative;
  min-height: 24rem;
  overflow: hidden;
  border-radius: 24px;
}

.project-demo-frame > * {
  width: 100%;
  height: 100%;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/App.mimesis.test.tsx`
Expected: PASS with no `iframe` elements in the deck and only the active Mimesis slide mounting its demo component.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/deck/slideData.tsx style.css src/App.mimesis.test.tsx
git commit -m "feat: render mimesis demos directly in slides"
```

## Chunk 3: Interaction Safety And Verification

### Task 5: Prevent deck navigation from hijacking demo interactions

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/mimesis/MimesisDemoFrame.tsx`
- Test: `src/App.demo-interactions.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

it("ignores demo-local wheel and keyboard events", () => {
  render(<App />);

  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });

  const demoZone = screen.getByTestId("mimesis-demo-frame");

  fireEvent.wheel(demoZone, { deltaY: 100 });
  expect(screen.getByText("01 — Mimesis Details")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/App.demo-interactions.test.tsx`
Expected: FAIL because wheel and keyboard handlers still treat the whole document as deck navigation territory.

- [ ] **Step 3: Write the minimal implementation**

Give every demo wrapper a stable interaction boundary:

```tsx
// src/mimesis/MimesisDemoFrame.tsx
export default function MimesisDemoFrame({ children }: { children: ReactNode }) {
  return (
    <div data-demo-interaction-zone data-testid="mimesis-demo-frame">
      {children}
    </div>
  );
}
```

Gate deck navigation in `src/App.tsx`:

```tsx
function isDemoInteractionTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("[data-demo-interaction-zone]"));
}
```

Skip wheel navigation when the event target is inside a demo zone.
Skip keyboard navigation when the active element is inside a demo zone or an editable control.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/App.demo-interactions.test.tsx`
Expected: PASS with demo-local events no longer advancing or rewinding the deck.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx src/mimesis/MimesisDemoFrame.tsx src/App.demo-interactions.test.tsx
git commit -m "fix: protect mimesis demo interactions"
```

### Task 6: Run full verification and clean up dead iframe-era code

**Files:**
- Modify: `style.css`
- Modify: `index.html`
- Test: full suite

- [ ] **Step 1: Write the failing test**

Use the existing test files from Tasks 1-5 as the regression suite for this cleanup task. Do not add a new behavior unless the cleanup exposes one.

- [ ] **Step 2: Run test to verify current failure or gap**

Run: `npm test`
Expected: If cleanup regressions exist, one of the existing deck or adapter tests should fail before the final pass.

- [ ] **Step 3: Write the minimal implementation**

Remove any remaining iframe-only markup, selectors, and helper code left over from the static implementation. Ensure `index.html` contains only the React mount root and shared document metadata. Keep `style.css` focused on the current React class structure, but preserve any unrelated user styling already present.

- [ ] **Step 4: Run test and build verification**

Run: `npm test`
Expected: PASS across the full `slides` test suite.

Run: `npm run build`
Expected: PASS with Vite resolving the sibling Mimesis imports and with the synced public assets present in `dist`.

- [ ] **Step 5: Commit**

```bash
git add index.html style.css
git commit -m "chore: finalize react mimesis slide integration"
```

## Verification Checklist

- [ ] `npm test`
- [ ] `npm run build`
- [ ] Manual smoke check in `npm run dev`
- [ ] Slide 4 mounts page curl and wiper only when active
- [ ] Slide 5 mounts black-white circle and staggered text only when active
- [ ] No visible `iframe` remains in the deck
- [ ] Demo wheel, input, and keyboard interactions do not move the deck unexpectedly

Plan complete and saved to `docs/superpowers/plans/2026-03-31-mimesis-react-slide-integration.md`. Ready to execute?
