import { describe, expect, it } from "vitest";
import { resolveWiperDriverViewPerformanceSettings } from "./wiperDriverViewPerformance";

describe("resolveWiperDriverViewPerformanceSettings", () => {
  it("keeps the default preset at full driver-view quality", () => {
    expect(resolveWiperDriverViewPerformanceSettings()).toEqual({
      canvasDpr: [1, 2],
      overlayTextureMaxSize: 2048,
      overlayTextureScale: 2,
      particleCount: undefined,
    });
  });

  it("reduces the driver-view render budget for slide embeds", () => {
    expect(resolveWiperDriverViewPerformanceSettings("slides")).toEqual({
      canvasDpr: 1,
      overlayTextureMaxSize: 1024,
      overlayTextureScale: 1,
      particleCount: 48,
    });
  });
});
