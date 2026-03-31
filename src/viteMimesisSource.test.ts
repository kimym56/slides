// @vitest-environment node

import path from "node:path";

import { expect, it } from "vitest";

import { resolveMimesisSourceRoot } from "../vite.config";

it("falls back to the vendored mimesis source when the sibling checkout is unavailable", () => {
  expect(resolveMimesisSourceRoot(false)).toBe(
    path.resolve(process.cwd(), "vendor/mimesis/src"),
  );
});

it("prefers the sibling mimesis checkout when it is available", () => {
  expect(resolveMimesisSourceRoot(true)).toBe(
    path.resolve(process.cwd(), "../mimesis/src"),
  );
});
