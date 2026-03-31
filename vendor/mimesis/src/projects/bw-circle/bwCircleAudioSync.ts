export interface BwCircleAudioSample {
  energy: number;
  bassEnergy: number;
  energyBaseline: number;
  bassEnergyBaseline: number;
  previousEnergy: number;
  previousBassEnergy: number;
  shouldReduceMotion: boolean;
}

export interface BwCircleAudioCue {
  energy: number;
  bassEnergy: number;
  onsetStrength: number;
}

export interface BwCircleAudioReactiveMotion {
  syncEnergy: number;
  syncPulse: number;
  ballKick: number;
  ballSquash: number;
  particleAccent: number;
}

export interface BwCircleAudioReactiveMotionInput {
  audioCue: BwCircleAudioCue | null;
  baseMotion: BwCircleAudioReactiveMotion;
  previousMotion: BwCircleAudioReactiveMotion | null;
  shouldReduceMotion: boolean;
}

export interface BwCircleAudioBaseMotionInput {
  audioControlsAccentMotion: boolean;
  syncCue: {
    energy: number;
    pulseStrength: number;
  } | null;
  syncMotion: {
    ballKick: number;
    ballSquash: number;
    particleAccent: number;
  } | null;
}

export interface BwCircleFrequencyLevels {
  energy: number;
  bassEnergy: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function lerp(from: number, to: number, amount: number) {
  return from + (to - from) * amount;
}

export function measureBwCircleFrequencyLevels(
  frequencyData: ArrayLike<number>,
): BwCircleFrequencyLevels {
  if (frequencyData.length === 0) {
    return {
      energy: 0,
      bassEnergy: 0,
    };
  }

  let total = 0;
  let bassTotal = 0;
  const bassBinCount = Math.max(1, Math.round(frequencyData.length * 0.3));

  for (let index = 0; index < frequencyData.length; index += 1) {
    const sample = clamp(frequencyData[index] / 255, 0, 1);

    total += sample;

    if (index < bassBinCount) {
      bassTotal += sample;
    }
  }

  return {
    energy: total / frequencyData.length,
    bassEnergy: bassTotal / bassBinCount,
  };
}

export function createBwCircleAudioCue({
  energy,
  bassEnergy,
  energyBaseline,
  bassEnergyBaseline,
  previousEnergy,
  previousBassEnergy,
  shouldReduceMotion,
}: BwCircleAudioSample): BwCircleAudioCue {
  const motionScale = shouldReduceMotion ? 0.55 : 1;
  const boundedEnergy = clamp(energy, 0, 1);
  const boundedBassEnergy = clamp(bassEnergy, 0, 1);
  const energyDelta = boundedEnergy - clamp(previousEnergy, 0, 1);
  const bassDelta = boundedBassEnergy - clamp(previousBassEnergy, 0, 1);
  const energyBaselineDelta = boundedEnergy - clamp(energyBaseline, 0, 1);
  const bassBaselineDelta = boundedBassEnergy - clamp(bassEnergyBaseline, 0, 1);
  const onsetDelta = Math.max(
    energyDelta,
    bassDelta * 0.55,
    energyBaselineDelta * 0.75,
    bassBaselineDelta * 0.85,
  );

  return {
    energy: boundedEnergy * motionScale,
    bassEnergy: boundedBassEnergy * motionScale,
    onsetStrength: clamp(onsetDelta * 2.8, 0, 1) * motionScale,
  };
}

export function createBwCircleAudioBaseMotion({
  audioControlsAccentMotion,
  syncCue,
  syncMotion,
}: BwCircleAudioBaseMotionInput): BwCircleAudioReactiveMotion {
  return {
    syncEnergy: syncCue?.energy ?? 0.28,
    syncPulse: syncCue?.pulseStrength ?? 0,
    ballKick: audioControlsAccentMotion ? 1 : (syncMotion?.ballKick ?? 1),
    ballSquash: audioControlsAccentMotion ? 0 : (syncMotion?.ballSquash ?? 0),
    particleAccent: audioControlsAccentMotion
      ? 1
      : (syncMotion?.particleAccent ?? 1),
  };
}

export function createBwCircleAudioReactiveMotion({
  audioCue,
  baseMotion,
  previousMotion,
  shouldReduceMotion,
}: BwCircleAudioReactiveMotionInput): BwCircleAudioReactiveMotion {
  if (!audioCue) {
    return baseMotion;
  }

  const motionScale = shouldReduceMotion ? 0.55 : 1;
  const smoothing = shouldReduceMotion ? 0.22 : 0.38;
  const previous = previousMotion ?? baseMotion;
  const target = {
    syncEnergy: clamp(
      baseMotion.syncEnergy +
        audioCue.energy * 0.18 * motionScale +
        audioCue.bassEnergy * 0.16 * motionScale +
        audioCue.onsetStrength * 0.08 * motionScale,
      0,
      1,
    ),
    syncPulse: clamp(
      baseMotion.syncPulse * 0.8 +
        audioCue.onsetStrength * 0.3 * motionScale +
        audioCue.bassEnergy * 0.12 * motionScale,
      0,
      1,
    ),
    ballKick:
      baseMotion.ballKick +
      audioCue.bassEnergy * 0.22 * motionScale +
      audioCue.onsetStrength * 0.18 * motionScale,
    ballSquash:
      baseMotion.ballSquash +
      audioCue.bassEnergy * 0.05 * motionScale +
      audioCue.onsetStrength * 0.09 * motionScale,
    particleAccent:
      baseMotion.particleAccent +
      audioCue.energy * 0.12 * motionScale +
      audioCue.bassEnergy * 0.09 * motionScale +
      audioCue.onsetStrength * 0.18 * motionScale,
  };

  return {
    syncEnergy: lerp(previous.syncEnergy, target.syncEnergy, smoothing),
    syncPulse: lerp(previous.syncPulse, target.syncPulse, smoothing),
    ballKick: Math.max(1, lerp(previous.ballKick, target.ballKick, smoothing)),
    ballSquash: Math.max(
      0,
      lerp(previous.ballSquash, target.ballSquash, smoothing),
    ),
    particleAccent: Math.max(
      1,
      lerp(previous.particleAccent, target.particleAccent, smoothing),
    ),
  };
}
