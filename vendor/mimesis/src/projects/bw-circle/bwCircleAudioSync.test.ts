import { describe, expect, it } from "vitest";
import {
  createBwCircleAudioBaseMotion,
  createBwCircleAudioReactiveMotion,
  createBwCircleAudioCue,
  measureBwCircleFrequencyLevels,
} from "./bwCircleAudioSync";

describe("measureBwCircleFrequencyLevels", () => {
  it("derives bounded overall and bass-weighted energy from analyser bins", () => {
    const levels = measureBwCircleFrequencyLevels(
      Uint8Array.from([255, 192, 96, 32, 0]),
    );

    expect(levels.energy).toBeCloseTo(0.451, 3);
    expect(levels.bassEnergy).toBeCloseTo(0.8765, 3);
    expect(levels.bassEnergy).toBeGreaterThan(levels.energy);
  });

  it("returns zeroed levels for an empty analyser frame", () => {
    expect(measureBwCircleFrequencyLevels(new Uint8Array())).toEqual({
      energy: 0,
      bassEnergy: 0,
    });
  });
});

describe("createBwCircleAudioCue", () => {
  it("returns bounded cue values", () => {
    const cue = createBwCircleAudioCue({
      energy: 1.4,
      bassEnergy: -0.3,
      energyBaseline: 0.2,
      bassEnergyBaseline: 0.1,
      previousEnergy: 0.2,
      previousBassEnergy: 0.1,
      shouldReduceMotion: false,
    });

    expect(cue.energy).toBeGreaterThanOrEqual(0);
    expect(cue.energy).toBeLessThanOrEqual(1);
    expect(cue.bassEnergy).toBeGreaterThanOrEqual(0);
    expect(cue.bassEnergy).toBeLessThanOrEqual(1);
    expect(cue.onsetStrength).toBeGreaterThanOrEqual(0);
    expect(cue.onsetStrength).toBeLessThanOrEqual(1);
  });

  it("raises onset strength when energy jumps sharply", () => {
    const cue = createBwCircleAudioCue({
      energy: 0.62,
      bassEnergy: 0.58,
      energyBaseline: 0.14,
      bassEnergyBaseline: 0.12,
      previousEnergy: 0.14,
      previousBassEnergy: 0.12,
      shouldReduceMotion: false,
    });

    expect(cue.onsetStrength).toBeGreaterThan(0.9);
  });

  it("keeps onset strength responsive to bass-led beat jumps", () => {
    const cue = createBwCircleAudioCue({
      energy: 0.34,
      bassEnergy: 0.68,
      energyBaseline: 0.2,
      bassEnergyBaseline: 0.24,
      previousEnergy: 0.28,
      previousBassEnergy: 0.22,
      shouldReduceMotion: false,
    });

    expect(cue.onsetStrength).toBeGreaterThan(0.4);
  });

  it("keeps onset strength responsive to smoothed peaks above the rolling baseline", () => {
    const cue = createBwCircleAudioCue({
      energy: 0.31,
      bassEnergy: 0.58,
      energyBaseline: 0.19,
      bassEnergyBaseline: 0.3,
      previousEnergy: 0.29,
      previousBassEnergy: 0.56,
      shouldReduceMotion: false,
    });

    expect(cue.onsetStrength).toBeGreaterThan(0.45);
  });

  it("damps cue amplitudes under reduced motion", () => {
    const fullMotion = createBwCircleAudioCue({
      energy: 0.62,
      bassEnergy: 0.58,
      energyBaseline: 0.14,
      bassEnergyBaseline: 0.12,
      previousEnergy: 0.14,
      previousBassEnergy: 0.12,
      shouldReduceMotion: false,
    });
    const reducedMotion = createBwCircleAudioCue({
      energy: 0.62,
      bassEnergy: 0.58,
      energyBaseline: 0.14,
      bassEnergyBaseline: 0.12,
      previousEnergy: 0.14,
      previousBassEnergy: 0.12,
      shouldReduceMotion: true,
    });

    expect(reducedMotion.energy).toBeLessThan(fullMotion.energy);
    expect(reducedMotion.bassEnergy).toBeLessThan(fullMotion.bassEnergy);
    expect(reducedMotion.onsetStrength).toBeLessThan(fullMotion.onsetStrength);
  });

  it("is deterministic for identical input", () => {
    expect(
      createBwCircleAudioCue({
        energy: 0.42,
        bassEnergy: 0.65,
        energyBaseline: 0.22,
        bassEnergyBaseline: 0.28,
        previousEnergy: 0.25,
        previousBassEnergy: 0.31,
        shouldReduceMotion: false,
      }),
    ).toEqual(
      createBwCircleAudioCue({
        energy: 0.42,
        bassEnergy: 0.65,
        energyBaseline: 0.22,
        bassEnergyBaseline: 0.28,
        previousEnergy: 0.25,
        previousBassEnergy: 0.31,
        shouldReduceMotion: false,
      }),
    );
  });
});

describe("createBwCircleAudioReactiveMotion", () => {
  it("returns the smooth base motion when no audio cue is available", () => {
    const baseMotion = {
      syncEnergy: 0.42,
      syncPulse: 0.18,
      ballKick: 1.08,
      ballSquash: 0.04,
      particleAccent: 1.03,
    };

    expect(
      createBwCircleAudioReactiveMotion({
        audioCue: null,
        baseMotion,
        previousMotion: null,
        shouldReduceMotion: false,
      }),
    ).toEqual(baseMotion);
  });

  it("eases into sharp audio spikes instead of snapping directly to them", () => {
    const baseMotion = {
      syncEnergy: 0.42,
      syncPulse: 0.18,
      ballKick: 1.08,
      ballSquash: 0.04,
      particleAccent: 1.03,
    };

    const blendedMotion = createBwCircleAudioReactiveMotion({
      audioCue: {
        energy: 0.9,
        bassEnergy: 0.8,
        onsetStrength: 1,
      },
      baseMotion,
      previousMotion: baseMotion,
      shouldReduceMotion: false,
    });

    expect(blendedMotion.syncEnergy).toBeCloseTo(0.5606, 4);
    expect(blendedMotion.syncPulse).toBeCloseTo(0.3168, 4);
    expect(blendedMotion.ballKick).toBeCloseTo(1.21528, 5);
    expect(blendedMotion.ballSquash).toBeCloseTo(0.0894, 4);
    expect(blendedMotion.particleAccent).toBeCloseTo(1.1668, 4);
  });

  it("resets beat-driven ball and particle accents when live audio owns sync motion", () => {
    expect(
      createBwCircleAudioBaseMotion({
        audioControlsAccentMotion: true,
        syncCue: {
          energy: 0.56,
          pulseStrength: 0.22,
        },
        syncMotion: {
          ballKick: 1.18,
          ballSquash: 0.1,
          particleAccent: 1.07,
        },
      }),
    ).toEqual({
      syncEnergy: 0.56,
      syncPulse: 0.22,
      ballKick: 1,
      ballSquash: 0,
      particleAccent: 1,
    });
  });

  it("keeps denser transients noticeably more animated than sparse ones", () => {
    const baseMotion = {
      syncEnergy: 0.42,
      syncPulse: 0.18,
      ballKick: 1,
      ballSquash: 0,
      particleAccent: 1,
    };
    const denseTransients = [
      { energy: 0.85, bassEnergy: 0.78, onsetStrength: 1 },
      { energy: 0.62, bassEnergy: 0.48, onsetStrength: 0.12 },
      { energy: 0.85, bassEnergy: 0.78, onsetStrength: 1 },
      { energy: 0.62, bassEnergy: 0.48, onsetStrength: 0.12 },
      { energy: 0.85, bassEnergy: 0.78, onsetStrength: 1 },
      { energy: 0.62, bassEnergy: 0.48, onsetStrength: 0.12 },
      { energy: 0.85, bassEnergy: 0.78, onsetStrength: 1 },
      { energy: 0.62, bassEnergy: 0.48, onsetStrength: 0.12 },
    ];
    const sparseTransients = [
      { energy: 0.85, bassEnergy: 0.78, onsetStrength: 1 },
      { energy: 0.22, bassEnergy: 0.14, onsetStrength: 0 },
      { energy: 0.22, bassEnergy: 0.14, onsetStrength: 0 },
      { energy: 0.22, bassEnergy: 0.14, onsetStrength: 0 },
      { energy: 0.85, bassEnergy: 0.78, onsetStrength: 1 },
      { energy: 0.22, bassEnergy: 0.14, onsetStrength: 0 },
      { energy: 0.22, bassEnergy: 0.14, onsetStrength: 0 },
      { energy: 0.22, bassEnergy: 0.14, onsetStrength: 0 },
    ];

    const denseMotion = denseTransients.reduce(
      (previousMotion, audioCue) =>
        createBwCircleAudioReactiveMotion({
          audioCue,
          baseMotion,
          previousMotion,
          shouldReduceMotion: false,
        }),
      null as ReturnType<typeof createBwCircleAudioReactiveMotion> | null,
    );
    const sparseMotion = sparseTransients.reduce(
      (previousMotion, audioCue) =>
        createBwCircleAudioReactiveMotion({
          audioCue,
          baseMotion,
          previousMotion,
          shouldReduceMotion: false,
        }),
      null as ReturnType<typeof createBwCircleAudioReactiveMotion> | null,
    );

    expect(denseMotion).not.toBeNull();
    expect(sparseMotion).not.toBeNull();
    expect(denseMotion?.particleAccent).toBeGreaterThan(
      (sparseMotion?.particleAccent ?? 0) + 0.05,
    );
    expect(denseMotion?.ballKick).toBeGreaterThan(
      (sparseMotion?.ballKick ?? 0) + 0.08,
    );
  });
});
