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

it("keeps the footer slide list intrinsic while adding horizontal breathing room", () => {
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(styleCss).toMatch(/\.slide-list-popover\s*\{[^}]*width:\s*fit-content;/s);
  expect(styleCss).not.toMatch(/\.slide-list-popover\s*\{[^}]*min-width:/s);
  expect(styleCss).toMatch(
    /\.slide-list-popover\s*\{[^}]*padding:\s*0\.35rem 0\.2rem 0\.35rem 0;/s,
  );
  expect(styleCss).toMatch(/\.slide-list-scroll-region\s*\{[^}]*width:\s*fit-content;/s);
  expect(styleCss).toMatch(
    /\.slide-list-scroll-region\s*\{[^}]*padding:\s*0\.15rem 0\.7rem 0\.15rem 0\.75rem;/s,
  );
  expect(styleCss).toMatch(/\.slide-list-button\s*\{[^}]*padding:\s*0\.7rem 1\.1rem;/s);
});

it("keeps the footer slide list scrollbar track transparent", () => {
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(styleCss).toMatch(
    /\.slide-list-scroll-region\s*\{[^}]*scrollbar-color:\s*color-mix\(in srgb, var\(--text-main\) 24%, transparent\)\s+transparent;/s,
  );
  expect(styleCss).toMatch(
    /\.slide-list-scroll-region::\-webkit-scrollbar-track\s*\{[^}]*background:\s*transparent;/s,
  );
  expect(styleCss).toMatch(
    /\.slide-list-scroll-region::\-webkit-scrollbar-thumb\s*\{[^}]*background-color:\s*color-mix\(in srgb, var\(--text-main\) 24%, transparent\);/s,
  );
});

it("clips the footer slide list with a separate inner scroll region", () => {
  const appTsx = readFileSync(path.resolve(process.cwd(), "src/App.tsx"), "utf8");
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(appTsx).toContain('className="slide-list-scroll-region"');
  expect(styleCss).toMatch(/\.slide-list-popover\s*\{[^}]*overflow:\s*hidden;/s);
  expect(styleCss).toMatch(
    /\.slide-list-scroll-region\s*\{[^}]*max-height:\s*min\(14rem, 52vh\);[^}]*overflow-y:\s*auto;/s,
  );
  expect(styleCss).toMatch(
    /\.slide-list-scroll-region\s*\{[^}]*scrollbar-gutter:\s*stable;/s,
  );
  expect(styleCss).toMatch(
    /\.slide-list-scroll-region\s*\{[^}]*padding:\s*0\.15rem 0\.7rem 0\.15rem 0\.75rem;/s,
  );
});

it("gives the right footer page control more spacing and a clearer edit state", () => {
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(styleCss).toMatch(/\.slide-counter-display\s*\{[^}]*align-items:\s*baseline;[^}]*gap:\s*0\.45rem;/s);
  expect(styleCss).toMatch(/\.slide-counter-shell\s*\{[^}]*font-variant-numeric:\s*tabular-nums;/s);
  expect(styleCss).toMatch(/\.slide-counter-trigger\s*\{[^}]*min-height:\s*1\.65rem;[^}]*padding:\s*0\.08rem 0\.18rem 0\.12rem;/s);
  expect(styleCss).toMatch(
    /\.slide-counter-trigger\s*\{[^}]*border:\s*none;[^}]*border-bottom:\s*0\.08em solid\s+color-mix\(in srgb, var\(--text-main\) 24%, transparent\);/s,
  );
  expect(styleCss).toMatch(/\.slide-counter-trigger\s*\{[^}]*border-radius:\s*0;/s);
  expect(styleCss).toMatch(/\.slide-counter-trigger\s*\{[^}]*background:\s*none;/s);
  expect(styleCss).toMatch(
    /\.slide-counter-trigger:hover,\s*\.slide-counter-trigger:focus-visible\s*\{[^}]*border-color:\s*var\(--accent\);/s,
  );
  expect(styleCss).toMatch(
    /\.page-jump-input\s*\{[^}]*border:\s*none;[^}]*border-bottom:\s*0\.08em solid var\(--accent\);/s,
  );
  expect(styleCss).toMatch(/\.page-jump-input\s*\{[^}]*border-radius:\s*0;/s);
  expect(styleCss).toMatch(/\.page-jump-input\s*\{[^}]*background:\s*transparent;/s);
  expect(styleCss).not.toMatch(
    /\.slide-list-button:focus-visible,\s*\.slide-counter-trigger:focus-visible,\s*\.page-jump-input:focus-visible\s*\{[^}]*box-shadow:\s*0 0 0 3px/s,
  );
  expect(styleCss).toMatch(/\.slide-counter-divider\s*\{[^}]*color:\s*color-mix\(in srgb, var\(--text-main\) 46%, transparent\);/s);
  expect(styleCss).toMatch(/\.slide-counter-total\s*\{[^}]*color:\s*color-mix\(in srgb, var\(--text-main\) 72%, transparent\);/s);
});

it("shows the left footer chevron as upward by default and downward when the list is open", () => {
  const styleCss = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(styleCss).toMatch(/\.current-section-chevron\s*\{[^}]*transform:\s*rotate\(180deg\);/s);
  expect(styleCss).toMatch(
    /\.current-section-trigger\.is-open\s+\.current-section-chevron\s*\{[^}]*transform:\s*rotate\(0deg\);/s,
  );
});
