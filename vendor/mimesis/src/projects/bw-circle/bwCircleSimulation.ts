export type BwCircleCameraMode = "normal" | "white" | "black";
export type BwCirclePerformanceMode = "default" | "sync-capture";

export interface BwCircleMimesisCue {
  angle: number;
  rotationVelocity: number;
}

export interface BwCircleMimesisLayout {
  isMobile: boolean;
  physicsScale: number;
  gravity: number;
  bounce: number;
  circleRadius: number;
  ballRadius: number;
  particleCountPerSet: number;
  speedScale: number;
}

export interface BwCircleParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface BwCirclePlaybackSample {
  currentTime: number;
  isPlaying: boolean;
  sampledAtMs: number;
}

export interface BwCirclePlaybackPredictionInput extends BwCirclePlaybackSample {
  nowMs: number;
}

export interface BwCircleBeatAccentCueInput {
  currentTime: number;
  bpm: number;
  isPlaying: boolean;
}

export interface BwCircleBeatAccentCue {
  accentStrength: number;
  beatPhase: number;
}

export interface BwCircleSyncCueInput {
  currentTime: number;
  isPlaying: boolean;
  baseCameraMode: BwCircleCameraMode;
}

export interface BwCircleSyncCue {
  rotationVelocity: number;
  pulseStrength: number;
  energy: number;
  cameraMode: BwCircleCameraMode;
}

export interface BwCircleSyncMotionProfileInput extends BwCirclePlaybackPredictionInput {
  bpm: number;
  baseCameraMode: BwCircleCameraMode;
  shouldReduceMotion: boolean;
}

export interface BwCircleSyncMotionProfile {
  predictedCurrentTime: number;
  syncCue: BwCircleSyncCue;
  beatAccent: BwCircleBeatAccentCue;
  ballKick: number;
  ballSquash: number;
  particleAccent: number;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

const BIASED_PARTICLE_RATIO = 0.16;
const BIASED_PARTICLE_ACROSS_SIGMA_FACTOR = 0.105;
const BIASED_PARTICLE_ALONG_SIGMA_FACTOR = 0.225;

function createSeededRandom(seed: number) {
  let state = seed >>> 0 || 1;

  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function sampleNormal(random: () => number) {
  let u = 0;

  while (u <= Number.EPSILON) {
    u = random();
  }

  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * random());
}

function sampleUniformDiscPoint({
  circleRadius,
  padding,
  random,
}: {
  circleRadius: number;
  padding: number;
  random: () => number;
}) {
  const angle = random() * Math.PI * 2;
  const distance = Math.sqrt(random()) * Math.max(circleRadius - padding, 0);

  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
  };
}

function sampleBoundaryCenterBiasedPoint({
  boundaryAngle,
  circleRadius,
  padding,
  random,
}: {
  boundaryAngle: number;
  circleRadius: number;
  padding: number;
  random: () => number;
}) {
  const maxDistance = Math.max(circleRadius - padding, 0);
  const acrossSigma = maxDistance * BIASED_PARTICLE_ACROSS_SIGMA_FACTOR;
  const alongSigma = maxDistance * BIASED_PARTICLE_ALONG_SIGMA_FACTOR;

  for (let attempt = 0; attempt < 12; attempt += 1) {
    const across = sampleNormal(random) * acrossSigma;
    const along = sampleNormal(random) * alongSigma;
    const x =
      -Math.sin(boundaryAngle) * across + Math.cos(boundaryAngle) * along;
    const y =
      Math.cos(boundaryAngle) * across + Math.sin(boundaryAngle) * along;

    if (Math.hypot(x, y) <= maxDistance) {
      return { x, y };
    }
  }

  return sampleUniformDiscPoint({ circleRadius, padding, random });
}

function getCircleRadius(width: number) {
  return (width < 768 ? 0.336 : 0.175) * width;
}

const CAMERA_SEQUENCE: BwCircleCameraMode[] = ["normal", "white", "black"];
const SYNC_CAPTURE_MAX_PIXEL_RATIO = 1;
const SYNC_CAPTURE_PARTICLE_DENSITY_MULTIPLIER = 0.24;

export function getBwCircleRenderPixelRatio(
  devicePixelRatio: number | undefined,
  performanceMode: BwCirclePerformanceMode = "default",
) {
  const safeDevicePixelRatio = Math.max(1, devicePixelRatio || 1);

  return performanceMode === "sync-capture"
    ? Math.min(safeDevicePixelRatio, SYNC_CAPTURE_MAX_PIXEL_RATIO)
    : safeDevicePixelRatio;
}

export function predictPlaybackTime({
  currentTime,
  isPlaying,
  sampledAtMs,
  nowMs,
}: BwCirclePlaybackPredictionInput) {
  if (!isPlaying) {
    return currentTime;
  }

  const elapsedSeconds = Math.max(0, nowMs - sampledAtMs) / 1000;

  return currentTime + elapsedSeconds;
}

export function createBeatAccentCue({
  currentTime,
  bpm,
  isPlaying,
}: BwCircleBeatAccentCueInput): BwCircleBeatAccentCue {
  if (!isPlaying) {
    return {
      accentStrength: 0,
      beatPhase: 0,
    };
  }

  const secondsPerBeat = 60 / Math.max(bpm, 1);
  const phaseSeconds =
    ((currentTime % secondsPerBeat) + secondsPerBeat) % secondsPerBeat;
  const beatPhase = phaseSeconds / secondsPerBeat;
  const accentStrength = clamp(1 - beatPhase / 0.18, 0, 1);

  return {
    accentStrength,
    beatPhase,
  };
}

export function createMimesisCue({
  secondsWithinMinute,
}: {
  secondsWithinMinute: number;
}): BwCircleMimesisCue {
  return {
    angle: (secondsWithinMinute / 60) * Math.PI * 2 - Math.PI / 2,
    rotationVelocity: (Math.PI * 2) / 60,
  };
}

export function createMimesisLayout(
  sceneWidth: number,
  viewportWidth = sceneWidth,
  performanceMode: BwCirclePerformanceMode = "default",
): BwCircleMimesisLayout {
  const isMobile = sceneWidth < 768;
  const physicsScale = clamp(sceneWidth / 1440, 0.4, 1.2);
  const circleRadius = getCircleRadius(sceneWidth);
  const ballRadius = Math.max(6, circleRadius * 0.056);
  const referenceCircleRadius = getCircleRadius(viewportWidth);
  const particleDensityRatio =
    referenceCircleRadius > 0 ? (circleRadius / referenceCircleRadius) ** 2 : 1;
  const particleDensityMultiplier =
    performanceMode === "sync-capture"
      ? SYNC_CAPTURE_PARTICLE_DENSITY_MULTIPLIER
      : 1;
  const particleCountPerSet = Math.max(
    1,
    Math.round(5000 * particleDensityRatio * particleDensityMultiplier),
  );

  return {
    isMobile,
    physicsScale,
    gravity: (isMobile ? 0.25 : 0.4) * physicsScale,
    bounce: isMobile ? 0.8 : 0.85,
    circleRadius,
    ballRadius,
    particleCountPerSet,
    speedScale: isMobile ? 0.6 : 1,
  };
}

export function createBwCircleParticles({
  boundaryAngle = 0,
  circleRadius,
  count,
  seed,
}: {
  boundaryAngle?: number;
  circleRadius: number;
  count: number;
  seed: number;
}): BwCircleParticle[] {
  const random = createSeededRandom(seed);
  const particles: BwCircleParticle[] = [];
  const biasedParticleCount = Math.round(count * BIASED_PARTICLE_RATIO);

  for (let index = 0; index < count; index += 1) {
    const radius = 1 + random() * 1.5;
    const position =
      index < biasedParticleCount
        ? sampleBoundaryCenterBiasedPoint({
            boundaryAngle,
            circleRadius,
            padding: radius + 2,
            random,
          })
        : sampleUniformDiscPoint({
            circleRadius,
            padding: radius + 2,
            random,
          });

    particles.push({
      x: position.x,
      y: position.y,
      vx: (random() - 0.5) * 0.8,
      vy: (random() - 0.5) * 0.8,
      radius,
    });
  }

  return particles;
}

export function createSyncCue({
  currentTime,
  isPlaying,
  baseCameraMode,
}: BwCircleSyncCueInput): BwCircleSyncCue {
  if (!isPlaying) {
    return {
      rotationVelocity: 0.0032,
      pulseStrength: 0,
      energy: 0.28,
      cameraMode: baseCameraMode,
    };
  }

  const phase = currentTime * 0.85;
  const pulseStrength = clamp((Math.sin(phase * 1.7) + 1) * 0.5, 0, 1);
  const energy = clamp(0.35 + (Math.sin(phase * 0.75) + 1) * 0.325, 0.35, 1);
  const rotationVelocity = clamp(
    0.0045 + pulseStrength * 0.0105 + energy * 0.0015,
    0.004,
    0.02,
  );
  const cameraIndex = Math.floor(currentTime / 7.5) % CAMERA_SEQUENCE.length;
  const cameraMode =
    pulseStrength > 0.72 ? CAMERA_SEQUENCE[cameraIndex] : baseCameraMode;

  return {
    rotationVelocity,
    pulseStrength,
    energy,
    cameraMode,
  };
}

export function createSyncMotionProfile({
  currentTime,
  isPlaying,
  sampledAtMs,
  nowMs,
  bpm,
  baseCameraMode,
  shouldReduceMotion,
}: BwCircleSyncMotionProfileInput): BwCircleSyncMotionProfile {
  const predictedCurrentTime = predictPlaybackTime({
    currentTime,
    isPlaying,
    sampledAtMs,
    nowMs,
  });
  const syncCue = createSyncCue({
    currentTime: predictedCurrentTime,
    isPlaying,
    baseCameraMode,
  });
  const rawBeatAccent = createBeatAccentCue({
    currentTime: predictedCurrentTime,
    bpm,
    isPlaying,
  });
  const accentStrength = shouldReduceMotion
    ? rawBeatAccent.accentStrength * 0.45
    : rawBeatAccent.accentStrength;

  return {
    predictedCurrentTime,
    syncCue,
    beatAccent: {
      ...rawBeatAccent,
      accentStrength,
    },
    ballKick: 1 + accentStrength * (shouldReduceMotion ? 0.08 : 0.18),
    ballSquash: accentStrength * (shouldReduceMotion ? 0.05 : 0.12),
    particleAccent: 1 + accentStrength * (shouldReduceMotion ? 0.03 : 0.08),
  };
}
