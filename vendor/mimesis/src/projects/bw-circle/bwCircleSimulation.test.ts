import { describe, expect, it } from "vitest";
import {
  createBwCircleParticles,
  createBeatAccentCue,
  createMimesisCue,
  createMimesisLayout,
  createSyncMotionProfile,
  createSyncCue,
  predictPlaybackTime,
} from "./bwCircleSimulation";

describe("predictPlaybackTime", () => {
  it("advances from the sampled timestamp while playback is running", () => {
    expect(
      predictPlaybackTime({
        currentTime: 10,
        isPlaying: true,
        sampledAtMs: 1_000,
        nowMs: 1_120,
      }),
    ).toBeCloseTo(10.12);
  });

  it("does not advance while playback is paused", () => {
    expect(
      predictPlaybackTime({
        currentTime: 10,
        isPlaying: false,
        sampledAtMs: 1_000,
        nowMs: 1_120,
      }),
    ).toBeCloseTo(10);
  });

  it("clamps negative elapsed wall-clock time to zero", () => {
    expect(
      predictPlaybackTime({
        currentTime: 10,
        isPlaying: true,
        sampledAtMs: 1_000,
        nowMs: 900,
      }),
    ).toBeCloseTo(10);
  });
});

describe("createBeatAccentCue", () => {
  it("returns a strong accent near beat onset", () => {
    const cue = createBeatAccentCue({
      currentTime: 4,
      bpm: 120,
      isPlaying: true,
    });

    expect(cue.accentStrength).toBeGreaterThan(0.95);
    expect(cue.beatPhase).toBeCloseTo(0);
  });

  it("returns a low accent between beats", () => {
    const cue = createBeatAccentCue({
      currentTime: 4.25,
      bpm: 120,
      isPlaying: true,
    });

    expect(cue.accentStrength).toBeLessThan(0.05);
  });

  it("returns an idle accent when playback is paused", () => {
    const cue = createBeatAccentCue({
      currentTime: 4,
      bpm: 120,
      isPlaying: false,
    });

    expect(cue.accentStrength).toBe(0);
  });

  it("is deterministic for the same timestamp and bpm", () => {
    expect(
      createBeatAccentCue({
        currentTime: 4.125,
        bpm: 132,
        isPlaying: true,
      }),
    ).toEqual(
      createBeatAccentCue({
        currentTime: 4.125,
        bpm: 132,
        isPlaying: true,
      }),
    );
  });
});

describe("createSyncCue", () => {
  it("returns an idle cue when playback is paused", () => {
    expect(
      createSyncCue({
        currentTime: 12.5,
        isPlaying: false,
        baseCameraMode: "normal",
      }),
    ).toEqual({
      rotationVelocity: 0.0032,
      pulseStrength: 0,
      energy: 0.28,
      cameraMode: "normal",
    });
  });

  it("returns bounded active motion values when playback is running", () => {
    const cue = createSyncCue({
      currentTime: 12.5,
      isPlaying: true,
      baseCameraMode: "normal",
    });

    expect(cue.rotationVelocity).toBeGreaterThan(0.004);
    expect(cue.rotationVelocity).toBeLessThan(0.02);
    expect(cue.pulseStrength).toBeGreaterThanOrEqual(0);
    expect(cue.pulseStrength).toBeLessThanOrEqual(1);
    expect(cue.energy).toBeGreaterThanOrEqual(0.35);
    expect(cue.energy).toBeLessThanOrEqual(1);
    expect(["normal", "white", "black"]).toContain(cue.cameraMode);
  });

  it("is deterministic for the same timestamp", () => {
    const a = createSyncCue({
      currentTime: 48.125,
      isPlaying: true,
      baseCameraMode: "white",
    });
    const b = createSyncCue({
      currentTime: 48.125,
      isPlaying: true,
      baseCameraMode: "white",
    });

    expect(a).toEqual(b);
  });
});

describe("createSyncMotionProfile", () => {
  it("combines predicted playback time with beat-driven motion boosts", () => {
    const profile = createSyncMotionProfile({
      currentTime: 3.95,
      isPlaying: true,
      sampledAtMs: 950,
      nowMs: 1_000,
      bpm: 120,
      baseCameraMode: "normal",
      shouldReduceMotion: false,
    });

    expect(profile.predictedCurrentTime).toBeCloseTo(4);
    expect(profile.syncCue.energy).toBeGreaterThanOrEqual(0.35);
    expect(profile.ballKick).toBeGreaterThan(1.15);
    expect(profile.ballSquash).toBeGreaterThan(0.1);
    expect(profile.particleAccent).toBeGreaterThan(1.06);
  });

  it("falls back to idle motion when playback is paused", () => {
    const profile = createSyncMotionProfile({
      currentTime: 4.25,
      isPlaying: false,
      sampledAtMs: 1_000,
      nowMs: 1_200,
      bpm: 120,
      baseCameraMode: "normal",
      shouldReduceMotion: false,
    });

    expect(profile.predictedCurrentTime).toBeCloseTo(4.25);
    expect(profile.beatAccent.accentStrength).toBe(0);
    expect(profile.ballKick).toBe(1);
    expect(profile.ballSquash).toBe(0);
    expect(profile.particleAccent).toBe(1);
  });

  it("dampens beat accents when reduced motion is enabled", () => {
    const fullMotion = createSyncMotionProfile({
      currentTime: 3.95,
      isPlaying: true,
      sampledAtMs: 950,
      nowMs: 1_000,
      bpm: 120,
      baseCameraMode: "normal",
      shouldReduceMotion: false,
    });
    const reducedMotion = createSyncMotionProfile({
      currentTime: 3.95,
      isPlaying: true,
      sampledAtMs: 950,
      nowMs: 1_000,
      bpm: 120,
      baseCameraMode: "normal",
      shouldReduceMotion: true,
    });

    expect(reducedMotion.predictedCurrentTime).toBeCloseTo(
      fullMotion.predictedCurrentTime,
    );
    expect(reducedMotion.ballKick).toBeLessThan(fullMotion.ballKick);
    expect(reducedMotion.ballKick).toBeGreaterThan(1);
    expect(reducedMotion.ballSquash).toBeLessThan(fullMotion.ballSquash);
    expect(reducedMotion.particleAccent).toBeLessThan(fullMotion.particleAccent);
  });
});

describe("createMimesisCue", () => {
  it("matches the original one-minute rotation cadence", () => {
    expect(createMimesisCue({ secondsWithinMinute: 0 }).angle).toBeCloseTo(
      -Math.PI / 2,
    );
    expect(createMimesisCue({ secondsWithinMinute: 15 }).angle).toBeCloseTo(0);
    expect(createMimesisCue({ secondsWithinMinute: 0 }).rotationVelocity).toBeCloseTo(
      (Math.PI * 2) / 60,
    );
  });
});

describe("createMimesisLayout", () => {
  it("matches the original desktop sizing and physics defaults", () => {
    const layout = createMimesisLayout(1440);

    expect(layout.isMobile).toBe(false);
    expect(layout.physicsScale).toBe(1);
    expect(layout.gravity).toBeCloseTo(0.4);
    expect(layout.bounce).toBeCloseTo(0.85);
    expect(layout.circleRadius).toBeCloseTo(252);
    expect(layout.ballRadius).toBeCloseTo(14.112);
    expect(layout.particleCountPerSet).toBe(5000);
    expect(layout.speedScale).toBe(1);
  });

  it("scales particle density by circle-area ratio for split-pane desktop scenes", () => {
    const createLayout = createMimesisLayout as (
      sceneWidth: number,
      viewportWidth?: number,
    ) => ReturnType<typeof createMimesisLayout>;
    const layout = createLayout(544, 1440);

    expect(layout.isMobile).toBe(true);
    expect(layout.circleRadius).toBeCloseTo(182.784);
    expect(layout.particleCountPerSet).toBe(2631);
  });

  it("matches the original mobile sizing and scaled physics", () => {
    const layout = createMimesisLayout(375);

    expect(layout.isMobile).toBe(true);
    expect(layout.physicsScale).toBeCloseTo(0.4);
    expect(layout.gravity).toBeCloseTo(0.1);
    expect(layout.bounce).toBeCloseTo(0.8);
    expect(layout.circleRadius).toBeCloseTo(126);
    expect(layout.ballRadius).toBeCloseTo(7.056);
    expect(layout.particleCountPerSet).toBe(5000);
    expect(layout.speedScale).toBeCloseTo(0.6);
  });

  it("reduces particle density during active sync capture", () => {
    const createLayout = createMimesisLayout as (
      sceneWidth: number,
      viewportWidth?: number,
      performanceMode?: "default" | "sync-capture",
    ) => ReturnType<typeof createMimesisLayout>;
    const layout = createLayout(1440, 1440, "sync-capture");

    expect(layout.particleCountPerSet).toBe(1200);
  });
});

describe("createBwCircleParticles", () => {
  it("creates a deterministic full-disc particle field with slight center-line bias", () => {
    const particles = createBwCircleParticles({
      circleRadius: 100,
      count: 400,
      seed: 42,
      boundaryAngle: 0,
    });

    expect(particles).toEqual(
      createBwCircleParticles({
        circleRadius: 100,
        count: 400,
        seed: 42,
        boundaryAngle: 0,
      }),
    );
    expect(particles).toHaveLength(400);
    expect(particles.some((particle) => particle.x < 0)).toBe(true);
    expect(particles.some((particle) => particle.x > 0)).toBe(true);

    const centerBandParticles = particles.filter(
      (particle) => Math.abs(particle.x) <= 12 && Math.abs(particle.y) <= 24,
    );
    const tighterCenterBandParticles = particles.filter(
      (particle) => Math.abs(particle.x) <= 10 && Math.abs(particle.y) <= 20,
    );
    const widerCenterBandParticles = particles.filter(
      (particle) => Math.abs(particle.x) <= 14 && Math.abs(particle.y) <= 28,
    );
    const outerCoverageParticles = particles.filter(
      (particle) => Math.hypot(particle.x, particle.y) >= 55,
    );

    expect(tighterCenterBandParticles).toHaveLength(27);
    expect(centerBandParticles).toHaveLength(37);
    expect(widerCenterBandParticles).toHaveLength(48);
    expect(outerCoverageParticles).toHaveLength(226);

    for (const particle of particles) {
      expect(Math.hypot(particle.x, particle.y) + particle.radius).toBeLessThanOrEqual(
        100,
      );
    }
  });
});
