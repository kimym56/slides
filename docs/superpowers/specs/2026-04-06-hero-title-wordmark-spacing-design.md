# Hero Title Wordmark Spacing Design

## Summary

Refine the first slide cover title so the English `Portfolio` and Korean `포트폴리오` read with optically even spacing instead of relying on one global `letter-spacing` value.

## Goals

- Limit the spacing change to the first slide hero title.
- Preserve the existing fonts, size, weight, and centered layout.
- Support both English and Korean cover titles.
- Make the hero title spacing intentional and stable across future refactors.

## Non-Goals

- Changing typography on other slides.
- Replacing the Inter or Pretendard font choices.
- Reworking slide navigation, locale routing, or footer behavior.

## Approved Decisions

- The first slide hero title will become a hand-tuned wordmark rather than a plain text node.
- The hero wordmark will render locale-specific character spans for `Portfolio` and `포트폴리오`.
- Spacing will be tuned with targeted CSS on those spans so the visual gaps look even, even when the glyph shapes differ.
- The implementation will stay isolated to the first slide and avoid introducing a reusable typography system for the whole deck.

## Architecture

`src/deck/slideData.tsx` will own the first-slide title rendering and will switch from a plain string inside `h1.hero-title` to locale-aware wordmark markup. That keeps the change local to the cover slide and avoids leaking title-specific logic into shared app chrome.

`style.css` will keep the base hero-title sizing rules, then add a small set of hero-wordmark selectors that control the spacing for each locale. The CSS will tune only the necessary character pairs instead of applying a broader tracking rule that still looks uneven.

## File Boundaries

- `src/deck/slideData.tsx`
  Add locale-aware cover-title wordmark rendering for the first slide.
- `style.css`
  Add hero wordmark layout and pair-specific spacing rules while preserving the existing title scale and alignment.
- `src/deck/slideData.test.tsx`
  Add regression coverage for English and Korean first-slide hero markup.
- `src/localeFonts.test.ts`
  Keep the typography contract aligned with the new wordmark approach.

## Risks

- Character-by-character markup is intentionally bespoke and could be over-applied if not kept tightly scoped to the hero title.
- Locale-specific spacing values can drift visually if the cover title copy changes in the future.
- Test coverage needs to assert structure clearly enough that later cleanup does not silently revert the wordmark back to plain text.
