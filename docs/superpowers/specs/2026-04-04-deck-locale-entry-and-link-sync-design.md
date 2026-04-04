# Deck Locale Entry And Link Sync Design

## Summary

Update the slide deck so English and Korean both live on explicit locale paths, `/` redirects based on browser language, the Korean deck loses the standalone interactive-link slide, project overview subtitles become real links, and the text-focused slides get a more deliberate presentation.

## Goals

- Treat `/en` and `/kr` as the canonical slide deck URLs.
- Redirect `/` to `/en` or `/kr` based on browser language preference.
- Remove the standalone interactive-link slide from both locales so slide order stays aligned.
- Render the overview-slide URL line as an actual link on the Mimesis, DSSkills, and Sellpath overview slides.
- Improve the first-slide chrome and introduction presentation so the text-led slides feel intentional rather than placeholder-like.
- Replace browser-default reference-link styling on the Mimesis detail slides with a deck-specific treatment.
- Remove awkward manual Korean line breaks and improve Korean wrapping behavior.

## Non-Goals

- Adding a router or general i18n framework.
- Changing the project media assets or demo components.
- Introducing locale persistence beyond the URL.

## Approved Decisions

- Canonical locale URLs are `/en` and `/kr`.
- `/` performs browser-language detection using `navigator.languages` first and `navigator.language` second.
- Browser detection only applies to `/`; explicit locale URLs always win.
- The locale toggle appears on the first slide at the top-right and links directly to the sibling locale path.
- English overview slides sync to the same linked-subtitle structure used by the Korean deck.

## Architecture

`index.html` performs the earliest possible locale decision so the browser can land on `/en` or `/kr` before the React app paints. `App` remains responsible for locale-aware shell copy, export handling, and a defensive client-side fallback in case the app is loaded on a non-canonical path.

`slideData` keeps the shared slide layouts but removes the interactive-link slide and upgrades the overview renderer so a project URL can be rendered as styled link metadata. `deckCopy` carries the updated locale content, including cleaner Korean text and explicit project URLs for the linked overview slides.

## File Boundaries

- `index.html`
  Add root-entry browser-language redirect and locale-aware initial `lang` handling.
- `src/App.tsx`
  Detect canonical locale paths, redirect defensively when needed, and render the first-slide locale toggle.
- `src/deck/deckCopy.tsx`
  Remove interactive-link copy, add overview project URLs, and rewrite Korean copy that currently depends on manual `<br />` breaks.
- `src/deck/slideData.tsx`
  Remove the interactive-link slide and render linked overview subtitles.
- `style.css`
  Add locale-toggle and overview-link styling, improve text-slide layout treatment, and apply Korean-friendly wrapping rules.
- `vite.config.ts`
  Emit both `/en/index.html` and `/kr/index.html` during build.
- Tests in `src/*.test.tsx`
  Update route, slide-order, and static-locale-entry expectations to match the new structure.

## Risks

- Client-side locale redirection can fail in test environments unless guarded carefully.
- Removing the second slide shifts every downstream navigation expectation.
- Changing overview subtitles to links affects both visual styling and accessible names, so tests need to assert the new link semantics directly.
