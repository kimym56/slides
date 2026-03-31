// @vitest-environment node

import { readFileSync } from "node:fs";
import path from "node:path";

it("imports the mimesis design tokens before the deck stylesheet", () => {
  const mainTsx = readFileSync(path.resolve(process.cwd(), "src/main.tsx"), "utf8");

  expect(mainTsx).toContain('import "@mimesis/styles/tokens.css";');
  expect(mainTsx).toContain('import "../style.css";');
});
