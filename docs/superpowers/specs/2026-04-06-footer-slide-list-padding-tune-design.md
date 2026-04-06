# Footer Slide List Padding Tune Design

## Summary

Tune the footer slide-picker spacing so it keeps intrinsic sizing but gains a more comfortable UI/UX padding ratio.

## Goals

- Keep the popover content-sized instead of introducing a fixed width.
- Increase perceived breathing room through padding only.
- Preserve the compact height and existing behavior.

## Approved Decisions

- Use a slightly larger panel inset: `0.5rem 0.75rem`.
- Use a stronger row inset: `0.7rem 1.1rem`.
- Leave width behavior, height cap, and interaction behavior unchanged.

## File Boundaries

- `style.css`
  Update the slide-list popover and row padding values.
- `src/localeFonts.test.ts`
  Update the stylesheet regression test to the new padding values.
