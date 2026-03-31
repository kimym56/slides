import { describe, expect, it } from "vitest";
import {
  DEFAULT_STAGGERED_TEXT_TUNING,
  STAGGERED_TEXT_GUI_FOLDERS,
} from "./staggeredTextTuning";

function getControlRange(key: string) {
  for (const folder of STAGGERED_TEXT_GUI_FOLDERS) {
    const control = folder.controls.find((item) => item.key === key);
    if (control) {
      return control;
    }
  }

  throw new Error(`Missing lil-gui control for ${key}`);
}

describe("staggeredTextTuning", () => {
  it("uses the current staggered-text timing profile as the default tuning", () => {
    expect(DEFAULT_STAGGERED_TEXT_TUNING.outgoingStaggerStepMs).toBe(60);
    expect(DEFAULT_STAGGERED_TEXT_TUNING.incomingStaggerStepMs).toBe(60);
    expect(DEFAULT_STAGGERED_TEXT_TUNING.handoffDelayMs).toBe(60);
    expect(DEFAULT_STAGGERED_TEXT_TUNING.outgoingDurationMs).toBe(788);
    expect(DEFAULT_STAGGERED_TEXT_TUNING.incomingDurationMs).toBe(710);
    expect(DEFAULT_STAGGERED_TEXT_TUNING.letterSpacingEm).toBe(-0.022);
    expect(DEFAULT_STAGGERED_TEXT_TUNING.fontWeight).toBe(700);
  });

  it("keeps lil-gui ranges broad enough for exploratory timing tuning", () => {
    expect(getControlRange("outgoingStaggerStepMs")).toMatchObject({
      min: 0,
      max: 240,
      step: 1,
    });
    expect(getControlRange("incomingStaggerStepMs")).toMatchObject({
      min: 0,
      max: 240,
      step: 1,
    });
    expect(getControlRange("handoffDelayMs")).toMatchObject({
      min: 0,
      max: 400,
      step: 1,
    });
    expect(getControlRange("outgoingDurationMs")).toMatchObject({
      min: 100,
      max: 2000,
      step: 1,
    });
    expect(getControlRange("incomingDurationMs")).toMatchObject({
      min: 100,
      max: 2000,
      step: 1,
    });
    expect(getControlRange("letterSpacingEm")).toMatchObject({
      min: -0.08,
      max: 0.08,
      step: 0.001,
    });
    expect(getControlRange("fontWeight")).toMatchObject({
      min: 300,
      max: 900,
      step: 1,
    });
  });
});
