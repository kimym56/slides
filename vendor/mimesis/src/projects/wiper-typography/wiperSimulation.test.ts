import { describe, expect, it } from "vitest";
import { WIPER_GLYPHS, WIPER_LINE_WIDTH } from "./wiperConfig";
import { computeLineCount } from "./wiperMath";
import {
  createWiperSimulationState,
  selectWiperParticleCount,
  stepWiperSimulationState,
} from "./wiperSimulation";

function createSequenceRandom(values: number[]) {
  let index = 0;

  return () => {
    const next = values[index] ?? values[values.length - 1] ?? 0;
    index += 1;
    return next;
  };
}

describe("wiperSimulation", () => {
  it("builds the same glyph and line entity counts as the 2d renderer", () => {
    const scene = createWiperSimulationState({
      width: 220,
      height: 110,
      particleCount: 2,
      phase: 0.25,
      random: createSequenceRandom([0, 0.5, 0.5, 0, 0.2, 0.4, 0.4, 0.2]),
    });

    expect(scene.glyphs).toHaveLength(2);
    expect(scene.bars).toHaveLength(computeLineCount(110, WIPER_LINE_WIDTH));
    expect(scene.glyphs[0]?.text).toBe(WIPER_GLYPHS[0]);
    expect(scene.bars[0]).toMatchObject({
      x: 110,
      y: 132,
      rotation: Math.PI * 0.25,
      width: WIPER_LINE_WIDTH,
    });
  });

  it("advances glyph physics while keeping bars on the shared wipe pose", () => {
    const scene = createWiperSimulationState({
      width: 220,
      height: 110,
      particleCount: 1,
      phase: 0,
      random: createSequenceRandom([0.5, 0, 0.5, 0.5]),
    });

    const initialY = scene.glyphs[0]?.y ?? 0;

    stepWiperSimulationState(scene, 1);

    expect(scene.glyphs[0]?.rotation).toBeGreaterThan(0);
    expect(scene.glyphs[0]?.y).toBeGreaterThan(initialY);
    expect(scene.bars[1]?.rotation).toBeCloseTo(Math.PI);
  });

  it("resets glyphs that fall beyond the stage", () => {
    const scene = createWiperSimulationState({
      width: 220,
      height: 110,
      particleCount: 1,
      random: createSequenceRandom([0.5, 0.5, 0.5, 0.5]),
    });

    if (scene.glyphs[0]) {
      scene.glyphs[0].y = 200;
      scene.glyphs[0].vy = 4;
    }

    stepWiperSimulationState(scene, 0.5);

    expect(scene.glyphs[0]?.y).toBe(-30);
  });

  it("selects the same particle budgets across device classes", () => {
    expect(selectWiperParticleCount({ coarsePointer: false, isIpad: false })).toBe(120);
    expect(selectWiperParticleCount({ coarsePointer: true, isIpad: true })).toBe(80);
    expect(selectWiperParticleCount({ coarsePointer: true, isIpad: false })).toBe(50);
  });
});
