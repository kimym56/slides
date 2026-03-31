import { describe, expect, it } from "vitest";
import { resolvePageCurlPerformanceSettings } from "./pageCurlPerformance";

describe("resolvePageCurlPerformanceSettings", () => {
  it("keeps the default preset at full interactive quality", () => {
    expect(resolvePageCurlPerformanceSettings()).toEqual({
      canvasDpr: undefined,
      meshSegments: 512,
      shadowMapSize: 4096,
    });
  });

  it("reduces the render budget for slide embeds", () => {
    expect(resolvePageCurlPerformanceSettings("slides")).toEqual({
      canvasDpr: 1,
      meshSegments: 128,
      shadowMapSize: 1024,
    });
  });
});
