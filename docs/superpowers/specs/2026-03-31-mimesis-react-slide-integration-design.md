# Mimesis React Slide Integration Design

## Summary

Replace the four `iframe`-based Mimesis embeds in `slides` with direct React mounts of the real Mimesis interactive project components while keeping `slides` as a separate app.

## Goals

- Remove the local `iframe` dependency from the Mimesis detail slides.
- Preserve exact demo behavior for the four current embeds.
- Keep `slides` and `mimesis` as separate projects.
- Lock each embedded demo to a single approved render mode.

## Non-Goals

- Generalize this for every Mimesis project.
- Extract a shared package between `slides` and `mimesis`.
- Preserve alternate mode toggles inside the deck.
- Recreate the full Mimesis project-detail page shell inside `slides`.

## Approved Decisions

- Convert `slides` from static HTML/JS into a React-based Vite app.
- Keep `slides` as a separate app instead of moving the deck into `mimesis`.
- Import the real Mimesis demo components directly from `../mimesis/src/projects/...`.
- Render only the interactive pane for each demo, not the full Mimesis `/project/[id]` route shell.
- Force one fixed mode per demo and hide all mode controls.

## Fixed Demo Mapping

- `ios-curl-animation` -> `PageCurlProject` with `initialMode="3d"`
- `wiper-typography` -> `WiperTypographyProject` with `initialMode="3d-driver"`
- `black-white-circle` -> `BwCircleProject` with `initialMode="sync"`
- `staggered-text` -> `StaggeredTextProject` with `initialMode="button"`

## Architecture

`slides` becomes the presentation shell and owns slide navigation, slide layout, copy, and demo mount policy. `mimesis` remains the source of truth for the four interactive implementations.

The deck will replace static slide markup with React components. Mimesis demo slots will be rendered through a thin adapter layer in `slides` so the deck does not import `mimesis` project code directly from slide content files.

## Proposed File Boundaries

### In `slides`

- `src/main.tsx`
  Bootstraps the React app.
- `src/App.tsx`
  Owns deck state, slide ordering, keyboard and wheel navigation, and active-slide rendering.
- `src/components/slides/...`
  Contains the React slide components and shared presentation helpers.
- `src/mimesis/PageCurlSlideDemo.tsx`
  Imports `PageCurlProject`, passes `projectId="ios-curl-animation"`, `initialMode="3d"`, and `hideControls`.
- `src/mimesis/WiperTypographySlideDemo.tsx`
  Imports `WiperTypographyProject`, passes `projectId="wiper-typography"`, `initialMode="3d-driver"`, and `hideControls`.
- `src/mimesis/BwCircleSlideDemo.tsx`
  Imports `BwCircleProject`, passes `projectId="black-white-circle"`, `initialMode="sync"`, and `hideControls`.
- `src/mimesis/StaggeredTextSlideDemo.tsx`
  Imports `StaggeredTextProject`, passes `projectId="staggered-text"`, `initialMode="button"`, and `hideControls`.
- `src/mimesis/MimesisDemoFrame.tsx`
  Provides the shared slide sizing shell and interaction boundary wrapper for embedded demos.
- `vite.config.ts`
  Allows cross-project source imports and defines compatibility aliases and env shims.
- `tsconfig.json`
  Adds React and path configuration needed by the imported Mimesis source.

### In `mimesis`

No planned behavior changes are required for this feature. If integration reveals import-path or runtime assumptions that break Vite consumption, only minimal compatibility edits should be made.

## Integration Strategy

### Source Import

`slides` should import the real project components from `mimesis` source rather than copying code or wrapping an HTTP route. This keeps parity with the existing implementations while avoiding duplication.

### Adapter Layer

Each embedded demo in `slides` should have a dedicated adapter component. The adapter layer exists to:

- lock mode and `projectId`
- force `hideControls`
- isolate sizing/layout concerns
- give `slides` one place to absorb future bundler compatibility fixes

### Asset Resolution

The imported Mimesis code assumes root-relative public assets such as:

- `/images/love-jones-cover.jpg`
- `/models/tesla_2018_model_3.glb`

`slides` must make the required Mimesis assets available at the same root-relative paths. The safest implementation is to mirror only the assets touched by the four embedded demos into `slides/public/...` or copy them as part of the build/dev workflow.

### Bundler Compatibility

The imported Mimesis code relies on:

- React client components
- CSS modules
- `process.env.NODE_ENV`
- the `@/*` alias in some transitive imports

`slides` must therefore:

- run on React + TypeScript
- define `process.env.NODE_ENV` in Vite
- allow imports from `../mimesis/src`
- provide a compatible alias for `@` that resolves to `../mimesis/src`

## Runtime Rules

### Mount Policy

Embedded Mimesis demos should mount only when their slide is active. Hidden demos should be unmounted instead of merely hidden with CSS. This prevents hidden `requestAnimationFrame`, WebGL, YouTube polling, audio sync work, and pointer listeners from continuing to run off-screen.

### Interaction Guarding

Once the demos are rendered in the same DOM tree as the deck, slide navigation can no longer assume global ownership of wheel and keyboard input. The deck must ignore navigation hotkeys when:

- focus is inside a form field or interactive control inside a demo
- the event target is inside the active demo boundary
- the active demo is intentionally consuming pointer or wheel interaction

This is required for:

- wheel behavior in `wiper-typography`
- button and text-input focus behavior in `staggered-text`
- URL input, embedded player, and audio sync interaction in `black-white-circle`

## Performance Notes

- Use lazy loading for the four slide demo adapters or the slide sections that contain them.
- Mount only the current slide's heavy demos.
- Keep the current deck transition behavior lightweight so it does not compete with canvas and WebGL rendering.

## Testing Strategy

### Slides App

- Verify slide navigation still works with keyboard, click, and wheel controls.
- Verify deck navigation does not trigger while interacting with an active demo.
- Verify only active demo slides mount their embedded components.

### Demo Adapters

- Smoke test each adapter to confirm it renders the correct Mimesis project with the expected fixed mode.
- Assert controls are hidden in deck usage.

### Build Verification

- Run a production build for `slides` to confirm Vite can resolve cross-project imports, CSS modules, aliases, and static assets.

## Risks

- Cross-project imports can expose assumptions in `mimesis` that currently only work under Next.
- Root-relative asset paths can break if not mirrored carefully.
- Shared global events may conflict with demo interaction if the deck does not gate navigation correctly.
- `black-white-circle` sync mode has the heaviest runtime surface because it includes embedded media and audio-capture behavior.

## Out Of Scope Follow-Ups

- Extracting shared interactive demo packages.
- Creating a reusable registry so any Mimesis project can be dropped into any deck slide.
- Embedding Mimesis reference panes or top chrome inside `slides`.
