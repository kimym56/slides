import { describe, expect, it } from "vitest";
import {
  stepIdlePhase,
  stepInteractivePhase,
  syncAutoplayAngle,
} from "./wiperPhase";

describe("wiperPhase", () => {
  it("resumes autoplay from the live phase after pointer leave", () => {
    expect(syncAutoplayAngle(0.5)).toBeCloseTo(Math.PI / 6);
  });

  it("steps toward the pointer target with a capped delta", () => {
    expect(stepInteractivePhase(0.2, 0.8, 0.05)).toBeCloseTo(0.25);
  });

  it("advances idle autoplay with absolute sine motion", () => {
    const next = stepIdlePhase(0, 0.01);

    expect(next.phase).toBeGreaterThan(0);
    expect(next.phase).toBeLessThanOrEqual(1);
    expect(next.autoPhaseAngle).toBeCloseTo(0.01);
  });
});
