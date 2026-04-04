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

it("keeps the first slide hero centered while leaving locale switching to separate chrome", () => {
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(styleCss).toContain("text-align: center;");
  expect(styleCss).toContain("align-items: center;");
  expect(styleCss).toContain("justify-content: space-between;");
  expect(styleCss).not.toContain(".hero-center-content::before");
  expect(styleCss).not.toContain(".hero-subtext span");
});

it("keeps the second slide introduction layout in its original lightweight style", () => {
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(styleCss).toMatch(/\.intro-left-panel\s*\{[^}]*gap:\s*2rem;/s);
  expect(styleCss).not.toMatch(/\.intro-left-panel\s*\{[^}]*max-width:/s);
  expect(styleCss).toMatch(/\.intro-sentence\s*\{[^}]*font-weight:\s*300;/s);
  expect(styleCss).toMatch(/\.resume-section h3\s*\{[^}]*border-bottom:/s);
  expect(styleCss).not.toMatch(/\.resume-section\s*\{[^}]*background:/s);
  expect(styleCss).not.toContain('html[lang="ko"] .intro-sentence,');
});

it("styles overview project links as plain text with only an external-link icon", () => {
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(styleCss).toMatch(/\.project-link\s*\{[^}]*padding:\s*0;/s);
  expect(styleCss).toMatch(/\.project-link\s*\{[^}]*border:\s*0;/s);
  expect(styleCss).toMatch(/\.project-link\s*\{[^}]*background:\s*none;/s);
  expect(styleCss).not.toMatch(/\.project-link\s*\{[^}]*border-radius:\s*999px;/s);
  expect(styleCss).toContain('.project-link::after');
});

it("styles the locale toggle as editorial text instead of a capsule control", () => {
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(styleCss).toContain(".locale-toggle-divider");
  expect(styleCss).toContain(".locale-toggle-link.is-active::after");
  expect(styleCss).toMatch(/\.locale-toggle-link\s*\{[^}]*padding:\s*0;/s);
  expect(styleCss).toMatch(/\.locale-toggle-link\s*\{[^}]*border:\s*0;/s);
  expect(styleCss).toMatch(/\.locale-toggle-link\s*\{[^}]*background:\s*none;/s);
});

it("gives project detail copy a wider reading measure inside a shared centered block", () => {
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(styleCss).toContain("max-width: 48ch;");
  expect(styleCss).toContain("width: min(100%, 48ch);");
  expect(styleCss).toContain(".project-details-layout--content-centered .details-copy--structured {");
});

it("standardizes detail-page spacing with one shared desktop gutter and centered content blocks", () => {
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(styleCss).toContain("--detail-section-gap: clamp(2.75rem, 4vw, 4.5rem);");
  expect(styleCss).toContain("gap: var(--detail-section-gap);");
  expect(styleCss).toContain(".project-details-layout--content-centered .details-column {");
  expect(styleCss).toContain("align-items: center;");
  expect(styleCss).toContain("margin-inline: auto;");
  expect(styleCss).toContain(
    ".project-details-layout--content-centered .project-detail-image-slot",
  );
  expect(styleCss).not.toContain(
    ".project-details-layout--content-centered > .details-column:first-child .details-copy--structured",
  );
  expect(styleCss).not.toContain(
    ".project-details-layout--content-centered > .details-column:last-child .details-copy--structured",
  );
});
