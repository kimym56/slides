# Deck Korean Locale Design

## Summary

Add a Korean presentation mode that activates when the site pathname ends with `/kr`, while keeping English as the default for all other paths.

## Goals

- Render the full deck in Korean for `/kr` and `/kr/`.
- Keep English as the default for `/` and every non-`/kr` path.
- Translate all visible deck copy, including slide titles, body copy, navigation labels, and accessibility labels.
- Reuse the existing slide layouts and demo adapters instead of duplicating slide structure.

## Non-Goals

- Adding a general-purpose i18n framework.
- Introducing React Router or server-side locale routing.
- Redirecting between locales automatically.
- Translating external linked resources or asset files themselves.

## Approved Decisions

- Detect locale from `window.location.pathname` in the client.
- Normalize a trailing slash so both `/kr` and `/kr/` map to Korean.
- Keep the app as a single React SPA and branch copy only.
- Replace the fixed `slides` export with a locale-aware slide factory.
- Store localized user-facing copy in typed data instead of duplicating slide layout logic.

## Architecture

`App` becomes the owner of locale detection and deck chrome localization. It will determine whether the current pathname resolves to English or Korean, set the document language, and request localized slide definitions.

`slideData` keeps the shared render helpers and slide layout structure, but the actual copy moves behind a locale-aware content layer. This keeps the existing slide order, demo mounting behavior, and layout classes unchanged while allowing the deck text to switch cleanly per locale.

## File Boundaries

- `src/App.tsx`
  Detect locale, set `document.documentElement.lang`, use localized deck chrome strings, and request locale-specific slides.
- `src/deck/slideData.tsx`
  Export `getSlides(locale)` instead of one fixed `slides` array while preserving existing render helpers and slide ordering.
- `src/deck/slideData.test.tsx`
  Verify localized slide titles and representative translated content.
- `src/App.test.tsx`
  Verify localized deck chrome and navigation labels.
- `src/App.navigation.test.tsx`
  Verify navigation still updates the localized section label.

## Route Detection Rules

- English is the fallback locale.
- Trim a trailing slash before checking the path suffix.
- If the normalized pathname ends with `/kr`, use Korean.
- Any other pathname, including nested routes not ending in `/kr`, uses English.

## Content Scope

The localized content set includes:

- slide titles
- headings and body copy
- bullet lists
- image alt text
- contact labels
- navigation button labels
- keyboard help text

Slide layout, animation classes, media sources, and external links remain shared between locales.

## Testing Strategy

- Add tests for locale-specific slide titles and translated content from `getSlides("en")` and `getSlides("ko")`.
- Add tests that stub the browser pathname and verify `App` renders localized navigation chrome.
- Keep existing navigation behavior tests and update them to assert the localized section label where needed.
- Run the full Vitest suite after implementation.

## Risks

- Inline JSX fragments used in translated copy can become harder to maintain if English and Korean drift.
- Path-based locale detection depends on SPA fallback support when directly loading `/kr`.
- Missing one deck chrome string would create a mixed-language UI, so coverage needs to include both slide content and shell labels.
