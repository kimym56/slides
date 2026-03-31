import { readFileSync } from "node:fs";
import path from "node:path";
import { render } from "@testing-library/react";
import { vi } from "vitest";
import PageCurlSlideDemo from "./PageCurlSlideDemo";
import WiperTypographySlideDemo from "./WiperTypographySlideDemo";

const { pageCurlSpy, wiperSpy } = vi.hoisted(() => ({
  pageCurlSpy: vi.fn(() => <div>page curl</div>),
  wiperSpy: vi.fn(() => <div>wiper</div>),
}));

vi.mock("@mimesis/projects/page-curl/PageCurlEmbed3D", () => ({
  default: pageCurlSpy,
}));

vi.mock(
  "@mimesis/projects/wiper-typography/WiperTypographyDriverView3D",
  () => ({
    default: wiperSpy,
  }),
);

it("locks the page curl slide demo to the interactive 3d curl with slide-fixed defaults", () => {
  render(<PageCurlSlideDemo />);

  expect(pageCurlSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      initialAngle: 45,
      initialOpacity: 0.5,
      initialPeelDist: 1.5,
      performancePreset: "slides",
    }),
    undefined,
  );
  expect(pageCurlSpy).not.toHaveBeenCalledWith(
    expect.objectContaining({
      demo: true,
    }),
    undefined,
  );
  expect(pageCurlSpy).not.toHaveBeenCalledWith(
    expect.objectContaining({
      hideControls: true,
    }),
    undefined,
  );
});

it("locks the wiper slide demo to the driver-view 3D implementation", () => {
  render(<WiperTypographySlideDemo />);

  expect(wiperSpy).toHaveBeenCalledWith(
    expect.objectContaining({
      performancePreset: "slides",
      projectId: "wiper-typography",
    }),
    undefined,
  );
});

it("keeps the slide demo wrapper chain flex-sized for desktop Mimesis embeds", () => {
  const css = readFileSync(path.resolve(process.cwd(), "style.css"), "utf8");

  expect(css).toMatch(
    /\.project-demo-slot\s*\{[^}]*display:\s*flex;[^}]*min-height:\s*0;/s,
  );
  expect(css).toMatch(
    /\.project-demo-frame\s*\{[^}]*display:\s*flex;[^}]*min-height:\s*0;/s,
  );
  expect(css).toMatch(
    /\.project-demo-frame\s*>\s*\*\s*\{[^}]*flex:\s*1 1 auto;[^}]*min-height:\s*0;/s,
  );
  expect(css).toMatch(
    /\.project-demo-slot\s*\{[^}]*aspect-ratio:\s*auto;[^}]*height:\s*60vh;/s,
  );
});
