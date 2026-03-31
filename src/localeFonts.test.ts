// @vitest-environment node

import { readFileSync } from "node:fs";
import path from "node:path";

it("loads Pretendard and scopes it to the Korean locale", () => {
  const indexHtml = readFileSync(path.resolve(process.cwd(), "index.html"), "utf8");
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(indexHtml).toContain(
    'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard-dynamic-subset.min.css',
  );
  expect(styleCss).toContain("--font-sans-en:");
  expect(styleCss).toContain("--font-sans-kr:");
  expect(styleCss).toContain('html[lang="ko"]');
  expect(styleCss).toContain('"Pretendard"');
});
