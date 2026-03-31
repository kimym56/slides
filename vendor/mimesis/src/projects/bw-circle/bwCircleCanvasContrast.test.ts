import { describe, expect, it } from "vitest";
import {
  determineBwCircleContrastTone,
  sampleBwCircleCanvasContrastTone,
} from "./bwCircleCanvasContrast";

const CANVAS_RECT = {
  bottom: 100,
  height: 100,
  left: 0,
  right: 100,
  top: 0,
  width: 100,
};

describe("determineBwCircleContrastTone", () => {
  it("returns light text for dark backgrounds and dark text for light backgrounds", () => {
    expect(determineBwCircleContrastTone(0.12)).toBe("light");
    expect(determineBwCircleContrastTone(0.88)).toBe("dark");
  });

  it("uses hysteresis to avoid flickering around the midpoint", () => {
    expect(determineBwCircleContrastTone(0.54, "light")).toBe("light");
    expect(determineBwCircleContrastTone(0.54, "dark")).toBe("dark");
  });
});

describe("sampleBwCircleCanvasContrastTone", () => {
  it("returns null when the label does not overlap the canvas", () => {
    expect(
      sampleBwCircleCanvasContrastTone({
        canvasHeight: 100,
        canvasRect: CANVAS_RECT,
        canvasWidth: 100,
        readPixel: () => Uint8ClampedArray.from([255, 255, 255, 255]),
        targetRect: {
          bottom: 140,
          height: 20,
          left: 120,
          right: 140,
          top: 120,
          width: 20,
        },
      }),
    ).toBeNull();
  });

  it("maps sampled white pixels to dark text", () => {
    expect(
      sampleBwCircleCanvasContrastTone({
        canvasHeight: 100,
        canvasRect: CANVAS_RECT,
        canvasWidth: 100,
        readPixel: () => Uint8ClampedArray.from([255, 255, 255, 255]),
        targetRect: {
          bottom: 40,
          height: 20,
          left: 20,
          right: 60,
          top: 20,
          width: 40,
        },
      }),
    ).toBe("dark");
  });
});
