import { describe, expect, it } from "vitest";
import {
  computeDriverViewPhase,
  getDriverViewCycleDuration,
} from "./wiperDriverView";

describe("wiperDriverView", () => {
  it("ping-pongs phase between 0 and 1 over time", () => {
    expect(computeDriverViewPhase(0, 4)).toBe(0);
    expect(computeDriverViewPhase(1, 4)).toBe(0.5);
    expect(computeDriverViewPhase(2, 4)).toBe(1);
    expect(computeDriverViewPhase(3, 4)).toBe(0.5);
    expect(computeDriverViewPhase(4, 4)).toBe(0);
    expect(computeDriverViewPhase(5, 4)).toBe(0.5);
  });

  it("reduces motion by lengthening the cycle", () => {
    expect(getDriverViewCycleDuration(false)).toBeLessThan(
      getDriverViewCycleDuration(true)
    );
  });
});
