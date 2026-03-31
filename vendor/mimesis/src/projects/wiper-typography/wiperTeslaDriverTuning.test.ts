import { describe, expect, it } from "vitest";
import {
  DEFAULT_TESLA_DRIVER_VIEW_TUNING,
  TESLA_DRIVER_VIEW_FOV_RANGE,
  TESLA_DRIVER_VIEW_GUI_FOLDERS,
} from "./wiperTeslaDriverTuning";

function getControlRange(key: string) {
  for (const folder of TESLA_DRIVER_VIEW_GUI_FOLDERS) {
    const control = folder.controls.find((item) => item.key === key);
    if (control) {
      return control;
    }
  }

  throw new Error(`Missing lil-gui control for ${key}`);
}

describe("wiperTeslaDriverTuning", () => {
  it("uses the approved driver-view preset as the default tuning", () => {
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.fov).toBe(64);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.cameraOffsetX).toBeCloseTo(0.19, 2);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.cameraOffsetY).toBeCloseTo(0.26, 2);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.cameraOffsetZ).toBeCloseTo(0.57, 2);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.lookAtOffsetX).toBeCloseTo(0.12, 2);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.lookAtOffsetY).toBeCloseTo(-0.0599, 4);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.lookAtOffsetZ).toBeCloseTo(0.03, 2);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.windscreenWidthScale).toBeCloseTo(0.72, 2);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.windscreenHeightScale).toBeCloseTo(0.68, 2);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.windscreenCenterOffsetX).toBeCloseTo(-0.0599, 4);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.windscreenCenterOffsetY).toBe(0);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.windscreenCenterOffsetNormal).toBe(0);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.glyphWidthScale).toBeCloseTo(1.37, 2);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.glyphHeightScale).toBeCloseTo(0.82, 2);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.glyphYBias).toBeCloseTo(0.53, 2);
    expect(DEFAULT_TESLA_DRIVER_VIEW_TUNING.glyphDepthOffset).toBeCloseTo(0.004, 3);
  });

  it("keeps lil-gui ranges broad enough for exploratory driver-view tuning", () => {
    expect(TESLA_DRIVER_VIEW_FOV_RANGE).toEqual({
      min: 8,
      max: 170,
    });
    expect(getControlRange("cameraOffsetX")).toMatchObject({ min: -1.5, max: 1.5 });
    expect(getControlRange("cameraOffsetY")).toMatchObject({ min: -1.5, max: 1.5 });
    expect(getControlRange("cameraOffsetZ")).toMatchObject({ min: -1.5, max: 2.5 });
    expect(getControlRange("lookAtOffsetX")).toMatchObject({ min: -2, max: 2 });
    expect(getControlRange("lookAtOffsetY")).toMatchObject({ min: -2, max: 2 });
    expect(getControlRange("lookAtOffsetZ")).toMatchObject({ min: -2, max: 2 });
    expect(getControlRange("windscreenWidthScale")).toMatchObject({
      min: 0.05,
      max: 3,
    });
    expect(getControlRange("windscreenHeightScale")).toMatchObject({
      min: 0.05,
      max: 3,
    });
    expect(getControlRange("windscreenCenterOffsetX")).toMatchObject({
      min: -2,
      max: 2,
    });
    expect(getControlRange("windscreenCenterOffsetY")).toMatchObject({
      min: -2,
      max: 2,
    });
    expect(getControlRange("windscreenCenterOffsetNormal")).toMatchObject({
      min: -1.5,
      max: 1.5,
    });
    expect(getControlRange("glyphWidthScale")).toMatchObject({ min: 0.05, max: 3 });
    expect(getControlRange("glyphHeightScale")).toMatchObject({ min: 0.05, max: 3 });
    expect(getControlRange("glyphYBias")).toMatchObject({ min: -2, max: 3 });
    expect(getControlRange("glyphDepthOffset")).toMatchObject({ min: -1, max: 1 });
  });
});
