"use client";

import {
  useEffect,
  useEffectEvent,
  useRef,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { useReducedMotion } from "framer-motion";
import type {
  BwCircleAudioSyncState,
  BwCirclePlaybackState,
} from "./BwCircleProject";
import {
  createBwCircleAudioBaseMotion,
  createBwCircleAudioReactiveMotion,
  createBwCircleAudioCue,
  measureBwCircleFrequencyLevels,
  type BwCircleAudioReactiveMotion,
} from "./bwCircleAudioSync";
import {
  createBwCircleRealtimeBpmBridge,
  type BwCircleRealtimeBpmBridge,
} from "./bwCircleRealtimeBpm";
import {
  createBwCircleParticles,
  createMimesisCue,
  createMimesisLayout,
  getBwCircleRenderPixelRatio,
  createSyncMotionProfile,
  type BwCircleParticle,
  type BwCirclePerformanceMode,
} from "./bwCircleSimulation";
import styles from "./BwCircleProject.module.css";

const FRICTION = 0.995;
const SQUASH_RECOVERY = 0.15;
const AUDIO_BASELINE_BLEND = 0.08;

function getAudioContextConstructor() {
  return (
    window.AudioContext ??
    ((window as Window & { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext as typeof AudioContext | undefined)
  );
}

interface BallState {
  color: string;
  scaleX: number;
  scaleY: number;
  squashAmount: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
}

interface SplashParticle extends BwCircleParticle {
  color: string;
  life: number;
}

interface SceneState {
  leftBall: BallState;
  rightBall: BallState;
  leftParticles: BwCircleParticle[];
  rightParticles: BwCircleParticle[];
  splashParticles: SplashParticle[];
  leftDividerLeakCooldown: number;
  rightDividerLeakCooldown: number;
}

interface BallImpactEvent {
  normalX: number;
  normalY: number;
  speed: number;
}

const DIVIDER_LEAK_DISTANCE = 72;
const DIVIDER_LEAK_COOLDOWN_MIN = 20;
const DIVIDER_LEAK_COOLDOWN_RANGE = 18;

function createBall(
  x: number,
  vx: number,
  vy: number,
  color: string,
): BallState {
  return {
    x,
    y: 0,
    vx,
    vy,
    color,
    scaleX: 1,
    scaleY: 1,
    squashAmount: 0,
  };
}

function createSceneState(
  sceneWidth: number,
  viewportWidth: number,
  performanceMode: BwCirclePerformanceMode = "default",
): SceneState {
  const layout = createMimesisLayout(
    sceneWidth,
    viewportWidth,
    performanceMode,
  );
  const seedBase = Math.max(1, Math.round(sceneWidth));
  const now = new Date();
  const boundaryAngle = createMimesisCue({
    secondsWithinMinute: now.getSeconds() + now.getMilliseconds() / 1000,
  }).angle;

  return {
    leftBall: createBall(
      -layout.circleRadius / 2,
      4 * layout.speedScale,
      -3 * layout.speedScale,
      "#000000",
    ),
    rightBall: createBall(
      layout.circleRadius / 2,
      -4 * layout.speedScale,
      3 * layout.speedScale,
      "#ffffff",
    ),
    leftParticles: createBwCircleParticles({
      boundaryAngle,
      circleRadius: layout.circleRadius,
      count: layout.particleCountPerSet,
      seed: seedBase * 17 + 1,
    }),
    rightParticles: createBwCircleParticles({
      boundaryAngle,
      circleRadius: layout.circleRadius,
      count: layout.particleCountPerSet,
      seed: seedBase * 17 + 2,
    }),
    splashParticles: [],
    leftDividerLeakCooldown: 0,
    rightDividerLeakCooldown: 0,
  };
}

function getBwCircleScenePerformanceMode(
  mode: "mimesis" | "sync",
  audioSyncStatus: BwCircleAudioSyncState["status"],
): BwCirclePerformanceMode {
  return mode === "sync" && audioSyncStatus === "active"
    ? "sync-capture"
    : "default";
}

function drawBall(
  context: CanvasRenderingContext2D,
  ball: BallState,
  ballRadius: number,
) {
  context.save();
  context.translate(ball.x, ball.y);
  context.rotate(Math.atan2(ball.vy, ball.vx));
  context.scale(ball.scaleY, ball.scaleX);
  context.beginPath();
  context.arc(0, 0, ballRadius, 0, Math.PI * 2);
  context.fillStyle = ball.color;
  context.fill();
  context.restore();
}

function pushSplashParticle(
  splashParticles: SplashParticle[],
  particle: SplashParticle,
) {
  splashParticles.push(particle);
}

function moveParticleOutsideCircle({
  circleRadius,
  color,
  normalX,
  normalY,
  particles,
  removeSource = true,
  sourceIndex,
  speedMultiplier = 1,
  splashParticles,
}: {
  circleRadius: number;
  color: string;
  normalX: number;
  normalY: number;
  particles: BwCircleParticle[];
  removeSource?: boolean;
  sourceIndex: number;
  speedMultiplier?: number;
  splashParticles: SplashParticle[];
}) {
  const sourceParticle = removeSource
    ? particles.splice(sourceIndex, 1)[0]
    : particles[sourceIndex];

  if (!sourceParticle) {
    return false;
  }

  let outwardX = normalX;
  let outwardY = normalY;
  const normalLength = Math.hypot(outwardX, outwardY);

  if (normalLength > 0.0001) {
    outwardX /= normalLength;
    outwardY /= normalLength;
  } else {
    const radialDistance = Math.hypot(sourceParticle.x, sourceParticle.y);

    if (radialDistance > 0.0001) {
      outwardX = sourceParticle.x / radialDistance;
      outwardY = sourceParticle.y / radialDistance;
    } else {
      const randomAngle = Math.random() * Math.PI * 2;
      outwardX = Math.cos(randomAngle);
      outwardY = Math.sin(randomAngle);
    }
  }

  const tangentX = -outwardY;
  const tangentY = outwardX;
  const tangentialOffset =
    (sourceParticle.x * tangentX + sourceParticle.y * tangentY) * 0.18 +
    (Math.random() - 0.5) * 6;
  const outwardSpeed = (0.24 + Math.random() * 0.42) * speedMultiplier;
  const tangentialSpeed =
    ((Math.random() - 0.5) * 0.28 +
      (sourceParticle.vx * tangentX + sourceParticle.vy * tangentY) * 0.08) *
    speedMultiplier;
  const spawnRadius =
    circleRadius + sourceParticle.radius + 3 + Math.random() * 2.5;

  pushSplashParticle(splashParticles, {
    x: outwardX * spawnRadius + tangentX * tangentialOffset,
    y: outwardY * spawnRadius + tangentY * tangentialOffset,
    vx:
      sourceParticle.vx * 0.24 +
      outwardX * outwardSpeed +
      tangentX * tangentialSpeed,
    vy:
      sourceParticle.vy * 0.24 +
      outwardY * outwardSpeed +
      tangentY * tangentialSpeed,
    radius: Math.min(3.2, Math.max(1, sourceParticle.radius + Math.random() * 0.4)),
    color,
    life: 1,
  });

  return true;
}

function releaseImpactParticles({
  circleRadius,
  color,
  impact,
  particles,
  splashParticles,
}: {
  circleRadius: number;
  color: string;
  impact: BallImpactEvent | null;
  particles: BwCircleParticle[];
  splashParticles: SplashParticle[];
}) {
  if (!impact || particles.length === 0) {
    return;
  }

  const impactPointX = impact.normalX * (circleRadius - 6);
  const impactPointY = impact.normalY * (circleRadius - 6);
  const sourceRadius = Math.max(30, circleRadius * 0.18);
  const desiredCount = 3 + Math.floor(Math.random() * 4);
  const candidates = particles
    .map((particle, index) => ({
      distance: Math.hypot(particle.x - impactPointX, particle.y - impactPointY),
      index,
    }))
    .filter((candidate) => candidate.distance <= sourceRadius)
    .sort((left, right) => left.distance - right.distance)
    .slice(0, desiredCount)
    .sort((left, right) => right.index - left.index);

  if (candidates.length === 0) {
    return;
  }

  const speedMultiplier = 1 + Math.min(impact.speed / 12, 0.45);

  for (const candidate of candidates) {
    moveParticleOutsideCircle({
      circleRadius,
      color,
      normalX: impact.normalX,
      normalY: impact.normalY,
      particles,
      removeSource: false,
      sourceIndex: candidate.index,
      speedMultiplier,
      splashParticles,
    });
  }
}

function updateSplashParticles({
  circleRadius,
  sceneHeight,
  sceneWidth,
  splashParticles,
}: {
  circleRadius: number;
  sceneHeight: number;
  sceneWidth: number;
  splashParticles: SplashParticle[];
}) {
  const angularVelocity = (Math.PI * 2) / 60;
  const rotationAmount = angularVelocity / 60;
  const cosRotation = Math.cos(rotationAmount);
  const sinRotation = Math.sin(rotationAmount);
  const maxX = sceneWidth / 2 + 50;
  const maxY = sceneHeight / 2 + 50;

  for (let index = splashParticles.length - 1; index >= 0; index -= 1) {
    const particle = splashParticles[index];
    const rotatedX = particle.x * cosRotation - particle.y * sinRotation;
    const rotatedY = particle.x * sinRotation + particle.y * cosRotation;

    particle.x = rotatedX;
    particle.y = rotatedY;
    particle.vx += (Math.random() - 0.5) * 0.08;
    particle.vy += (Math.random() - 0.5) * 0.08;
    particle.vx *= 0.97;
    particle.vy *= 0.97;
    particle.x += particle.vx;
    particle.y += particle.vy;

    const distanceFromCenter = Math.hypot(particle.x, particle.y);
    const minDistance = circleRadius + particle.radius + 2;

    if (distanceFromCenter < minDistance && distanceFromCenter > 0.0001) {
      const normalX = particle.x / distanceFromCenter;
      const normalY = particle.y / distanceFromCenter;
      const dotProduct = particle.vx * normalX + particle.vy * normalY;

      particle.x = normalX * minDistance;
      particle.y = normalY * minDistance;

      if (dotProduct < 0) {
        particle.vx -= dotProduct * normalX;
        particle.vy -= dotProduct * normalY;
      }
    }

    if (
      particle.x < -maxX ||
      particle.x > maxX ||
      particle.y < -maxY ||
      particle.y > maxY
    ) {
      splashParticles.splice(index, 1);
    }
  }
}

function updateParticles({
  angle,
  ball,
  circleRadius,
  dividerLeakCooldown,
  isRightHalf,
  particleAccent,
  particles,
  splashColor,
  splashParticles,
}: {
  angle: number;
  ball: BallState;
  circleRadius: number;
  dividerLeakCooldown: number;
  isRightHalf: boolean;
  particleAccent: number;
  particles: BwCircleParticle[];
  splashColor: string;
  splashParticles: SplashParticle[];
}) {
  const repelRadius = 60;
  const gravity = 0.004;
  const damping = 0.98;
  const minSpeed = 0.3;
  const resetSpeed = 0.5;
  const boundaryBounce = 0.8;
  let nextDividerLeakCooldown = Math.max(0, dividerLeakCooldown - 1);

  for (let index = particles.length - 1; index >= 0; index -= 1) {
    const particle = particles[index];
    const toBallX = particle.x - ball.x;
    const toBallY = particle.y - ball.y;
    const distanceToBall = Math.hypot(toBallX, toBallY);

    if (distanceToBall < repelRadius && distanceToBall > 0.0001) {
      const force = ((repelRadius - distanceToBall) / repelRadius) * 1.5;
      particle.vx += (toBallX / distanceToBall) * force;
      particle.vy += (toBallY / distanceToBall) * force;
    }

    particle.vy += gravity;
    particle.x += particle.vx;
    particle.y += particle.vy;
    particle.vx *= damping;
    particle.vy *= damping;

    const accentImpulse = (particleAccent - 1) * 0.35;

    if (accentImpulse > 0) {
      const speed = Math.hypot(particle.vx, particle.vy);

      if (speed > 0.0001) {
        particle.vx += (particle.vx / speed) * accentImpulse;
        particle.vy += (particle.vy / speed) * accentImpulse;
      } else {
        const accentAngle = Math.random() * Math.PI * 2;
        particle.vx += Math.cos(accentAngle) * accentImpulse;
        particle.vy += Math.sin(accentAngle) * accentImpulse;
      }
    }

    const speed = Math.hypot(particle.vx, particle.vy);
    if (speed < minSpeed) {
      const nextAngle = Math.random() * Math.PI * 2;
      particle.vx = Math.cos(nextAngle) * resetSpeed;
      particle.vy = Math.sin(nextAngle) * resetSpeed;
    }

    const distanceFromCenter = Math.hypot(particle.x, particle.y);
    const maxDistance = circleRadius - particle.radius;

    if (distanceFromCenter > maxDistance && distanceFromCenter > 0.0001) {
      const normalX = particle.x / distanceFromCenter;
      const normalY = particle.y / distanceFromCenter;
      const dotProduct = particle.vx * normalX + particle.vy * normalY;

      particle.x = normalX * maxDistance;
      particle.y = normalY * maxDistance;
      particle.vx -= 2 * dotProduct * normalX;
      particle.vy -= 2 * dotProduct * normalY;
    }

    const rotatedX =
      particle.x * Math.cos(-angle) - particle.y * Math.sin(-angle);
    const rotatedY =
      particle.x * Math.sin(-angle) + particle.y * Math.cos(-angle);
    const boundary = isRightHalf ? particle.radius : -particle.radius;
    const isOutside = isRightHalf ? rotatedX < boundary : rotatedX > boundary;

    if (isOutside) {
      if (
        nextDividerLeakCooldown <= 0 &&
        distanceToBall <= DIVIDER_LEAK_DISTANCE
      ) {
        const radialDistance = Math.hypot(particle.x, particle.y);
        const normalX =
          radialDistance > 0.0001 ? particle.x / radialDistance : Math.cos(angle);
        const normalY =
          radialDistance > 0.0001 ? particle.y / radialDistance : Math.sin(angle);

        if (
          moveParticleOutsideCircle({
            circleRadius,
            color: splashColor,
            normalX,
            normalY,
            particles,
            removeSource: false,
            sourceIndex: index,
            speedMultiplier: 0.92 + Math.random() * 0.18,
            splashParticles,
          })
        ) {
          nextDividerLeakCooldown =
            DIVIDER_LEAK_COOLDOWN_MIN +
            Math.floor(Math.random() * DIVIDER_LEAK_COOLDOWN_RANGE);
          continue;
        }
      }

      const velocityX =
        particle.vx * Math.cos(-angle) - particle.vy * Math.sin(-angle);
      const velocityY =
        particle.vx * Math.sin(-angle) + particle.vy * Math.cos(-angle);
      const nextVelocityX = -velocityX * boundaryBounce;

      particle.vx =
        nextVelocityX * Math.cos(angle) - velocityY * Math.sin(angle);
      particle.vy =
        nextVelocityX * Math.sin(angle) + velocityY * Math.cos(angle);
      particle.x = boundary * Math.cos(angle) - rotatedY * Math.sin(angle);
      particle.y = boundary * Math.sin(angle) + rotatedY * Math.cos(angle);
    }
  }

  return nextDividerLeakCooldown;
}

function updateBall({
  angle,
  ball,
  ballRadius,
  beatKick,
  beatSquash,
  bounce,
  circleRadius,
  gravity,
  isLeftSide,
  speedBoost,
}: {
  angle: number;
  ball: BallState;
  ballRadius: number;
  beatKick: number;
  beatSquash: number;
  bounce: number;
  circleRadius: number;
  gravity: number;
  isLeftSide: boolean;
  speedBoost: number;
}) {
  const beatImpulse = (beatKick - 1) * (circleRadius < 180 ? 0.9 : 1.2);
  let impactEvent: BallImpactEvent | null = null;

  if (beatImpulse > 0) {
    const speed = Math.hypot(ball.vx, ball.vy);

    if (speed > 0.0001) {
      ball.vx += (ball.vx / speed) * beatImpulse;
      ball.vy += (ball.vy / speed) * beatImpulse * 0.9;
    } else {
      ball.vx += (isLeftSide ? 1 : -1) * beatImpulse;
      ball.vy -= beatImpulse * 0.6;
    }

    ball.squashAmount = Math.max(ball.squashAmount, beatSquash);
  }

  ball.vy += gravity;
  ball.vx *= FRICTION;
  ball.vy *= FRICTION;
  ball.x += ball.vx;
  ball.y += ball.vy;

  const distance = Math.hypot(ball.x, ball.y);
  const maxDistance = circleRadius - ballRadius;

  if (distance > maxDistance) {
    const normalX = ball.x / distance;
    const normalY = ball.y / distance;
    const dotProduct = ball.vx * normalX + ball.vy * normalY;

    ball.x = normalX * maxDistance;
    ball.y = normalY * maxDistance;
    ball.vx -= 2 * dotProduct * normalX;
    ball.vy -= 2 * dotProduct * normalY;
    ball.vx *= bounce;
    ball.vy *= bounce;

    const collisionSpeed = Math.hypot(ball.vx, ball.vy);
    const speedThreshold = maxDistance < 180 ? 6 : 10;
    const boostAmount = (maxDistance < 180 ? 1.5 : 1.8) * speedBoost;

    if (collisionSpeed < speedThreshold) {
      ball.vx *= boostAmount;
      ball.vy *= boostAmount;
    }

    ball.squashAmount = Math.min(Math.abs(dotProduct) * 0.04, 0.35);
    impactEvent = {
      normalX,
      normalY,
      speed: collisionSpeed,
    };
  }

  const rotatedX = ball.x * Math.cos(-angle) - ball.y * Math.sin(-angle);
  const rotatedY = ball.x * Math.sin(-angle) + ball.y * Math.cos(-angle);

  if (isLeftSide) {
    if (rotatedX > -ballRadius) {
      const reflectedX = -ballRadius;
      const velocityX = ball.vx * Math.cos(-angle) - ball.vy * Math.sin(-angle);
      const velocityY = ball.vx * Math.sin(-angle) + ball.vy * Math.cos(-angle);
      const nextVelocityX = -velocityX * bounce;

      ball.vx = nextVelocityX * Math.cos(angle) - velocityY * Math.sin(angle);
      ball.vy = nextVelocityX * Math.sin(angle) + velocityY * Math.cos(angle);
      ball.x = reflectedX * Math.cos(angle) - rotatedY * Math.sin(angle);
      ball.y = reflectedX * Math.sin(angle) + rotatedY * Math.cos(angle);
    }
  } else if (rotatedX < ballRadius) {
    const reflectedX = ballRadius;
    const velocityX = ball.vx * Math.cos(-angle) - ball.vy * Math.sin(-angle);
    const velocityY = ball.vx * Math.sin(-angle) + ball.vy * Math.cos(-angle);
    const nextVelocityX = -velocityX * bounce;

    ball.vx = nextVelocityX * Math.cos(angle) - velocityY * Math.sin(angle);
    ball.vy = nextVelocityX * Math.sin(angle) + velocityY * Math.cos(angle);
    ball.x = reflectedX * Math.cos(angle) - rotatedY * Math.sin(angle);
    ball.y = reflectedX * Math.sin(angle) + rotatedY * Math.cos(angle);
  }

  ball.squashAmount *= 1 - SQUASH_RECOVERY;

  const speed = Math.hypot(ball.vx, ball.vy);
  const stretchAmount = Math.min(speed * 0.01, 0.2);

  if (ball.squashAmount > stretchAmount) {
    ball.scaleX = 1 + ball.squashAmount;
    ball.scaleY = 1 - ball.squashAmount * 0.5;
  } else {
    ball.scaleX = 1 - stretchAmount * 0.3;
    ball.scaleY = 1 + stretchAmount * 0.5;
  }

  return impactEvent;
}

export default function BwCircleScene({
  audioSync,
  bpm,
  mode,
  onEstimatedBpmChange,
  playbackRef,
  syncOverlay,
}: {
  audioSync: BwCircleAudioSyncState;
  bpm: number;
  mode: "mimesis" | "sync";
  onEstimatedBpmChange?: (estimatedBpm: number | null) => void;
  playbackRef: MutableRefObject<BwCirclePlaybackState>;
  syncOverlay?: ReactNode;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bpmRef = useRef(bpm);
  const modeRef = useRef(mode);
  const shouldReduceMotion = useReducedMotion() ?? false;
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSyncRef = useRef(audioSync);
  const frequencyDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const mediaSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const previousAudioEnergyRef = useRef(0);
  const previousBassAudioEnergyRef = useRef(0);
  const audioEnergyBaselineRef = useRef(0);
  const bassAudioEnergyBaselineRef = useRef(0);
  const bpmBridgeRef = useRef<BwCircleRealtimeBpmBridge | null>(null);
  const audioReactiveMotionRef = useRef<BwCircleAudioReactiveMotion | null>(
    null,
  );
  const publishedEstimatedBpmRef = useRef<number | null>(null);

  const publishEstimatedBpm = useEffectEvent(
    (nextEstimatedBpm: number | null) => {
      if (publishedEstimatedBpmRef.current === nextEstimatedBpm) {
        return;
      }

      publishedEstimatedBpmRef.current = nextEstimatedBpm;
      onEstimatedBpmChange?.(nextEstimatedBpm);
    },
  );

  const resetEstimatedBpm = useEffectEvent(() => {
    publishEstimatedBpm(null);
  });

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    audioSyncRef.current = audioSync;
  }, [audioSync]);

  useEffect(() => {
    let cancelled = false;

    const disconnectAudioGraph = () => {
      bpmBridgeRef.current?.disconnect();
      bpmBridgeRef.current = null;
      mediaSourceRef.current?.disconnect();
      analyserRef.current?.disconnect();
      mediaSourceRef.current = null;
      analyserRef.current = null;
      frequencyDataRef.current = null;
      previousAudioEnergyRef.current = 0;
      previousBassAudioEnergyRef.current = 0;
      audioEnergyBaselineRef.current = 0;
      bassAudioEnergyBaselineRef.current = 0;
      audioReactiveMotionRef.current = null;
      resetEstimatedBpm();
    };

    if (mode !== "sync" || audioSync.status !== "active" || !audioSync.stream) {
      disconnectAudioGraph();
      return;
    }

    const AudioContextConstructor = getAudioContextConstructor();

    if (!AudioContextConstructor) {
      disconnectAudioGraph();
      return;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextConstructor();
    }

    const audioContext = audioContextRef.current;
    const mediaSource = audioContext.createMediaStreamSource(audioSync.stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = shouldReduceMotion ? 0.84 : 0.72;
    mediaSource.connect(analyser);

    mediaSourceRef.current = mediaSource;
    analyserRef.current = analyser;
    frequencyDataRef.current = new Uint8Array(analyser.frequencyBinCount);
    previousAudioEnergyRef.current = 0;
    previousBassAudioEnergyRef.current = 0;
    audioEnergyBaselineRef.current = 0;
    bassAudioEnergyBaselineRef.current = 0;

    void audioContext.resume?.();
    void createBwCircleRealtimeBpmBridge({
      audioContext,
      onBpm: (nextBpm) => {
        if (
          modeRef.current === "sync" &&
          audioSyncRef.current.status === "active" &&
          playbackRef.current.isPlaying
        ) {
          publishEstimatedBpm(nextBpm);
        }
      },
      sourceNode: mediaSource,
    })
      .then((bridge) => {
        if (cancelled) {
          bridge.disconnect();
          return;
        }

        bpmBridgeRef.current = bridge;
      })
      .catch(() => {
        if (!cancelled) {
          publishEstimatedBpm(null);
        }
      });

    return () => {
      cancelled = true;
      disconnectAudioGraph();
    };
  }, [audioSync.status, audioSync.stream, mode, playbackRef, shouldReduceMotion]);

  useEffect(() => {
    return () => {
      mediaSourceRef.current?.disconnect();
      analyserRef.current?.disconnect();
      mediaSourceRef.current = null;
      analyserRef.current = null;
      frequencyDataRef.current = null;
      previousAudioEnergyRef.current = 0;
      previousBassAudioEnergyRef.current = 0;
      audioEnergyBaselineRef.current = 0;
      bassAudioEnergyBaselineRef.current = 0;
      bpmBridgeRef.current?.disconnect();
      bpmBridgeRef.current = null;
      audioReactiveMotionRef.current = null;

      const audioContext = audioContextRef.current;
      audioContextRef.current = null;

      void audioContext?.close?.();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let performanceMode = getBwCircleScenePerformanceMode(
      modeRef.current,
      audioSyncRef.current.status,
    );
    let sceneState = createSceneState(1440, 1440, performanceMode);

    const resize = () => {
      const parent = canvas.parentElement;

      if (!parent) {
        return;
      }

      const bounds = parent.getBoundingClientRect();
      performanceMode = getBwCircleScenePerformanceMode(
        modeRef.current,
        audioSyncRef.current.status,
      );
      const ratio = getBwCircleRenderPixelRatio(
        window.devicePixelRatio,
        performanceMode,
      );
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.max(1, Math.round(bounds.width * ratio));
      canvas.height = Math.max(1, Math.round(bounds.height * ratio));
      canvas.style.width = `${bounds.width}px`;
      canvas.style.height = `${bounds.height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      sceneState = createSceneState(bounds.width, window.innerWidth, performanceMode);
    };

    const render = () => {
      const nextPerformanceMode = getBwCircleScenePerformanceMode(
        modeRef.current,
        audioSyncRef.current.status,
      );

      if (nextPerformanceMode !== performanceMode) {
        resize();
      }

      const layout = createMimesisLayout(
        width || window.innerWidth,
        window.innerWidth,
        performanceMode,
      );
      const ballRadius = layout.ballRadius;
      const nowMs = performance.now();
      const now = new Date();
      const secondsWithinMinute =
        now.getSeconds() + now.getMilliseconds() / 1000;
      const mimesisCue = createMimesisCue({ secondsWithinMinute });
      const playbackValue = playbackRef.current;
      const modeValue = modeRef.current;
      const analyser = analyserRef.current;
      const frequencyData = frequencyDataRef.current;
      const syncMotion =
        modeValue === "sync"
          ? createSyncMotionProfile({
              currentTime: playbackValue.currentTime,
              isPlaying: playbackValue.isPlaying,
              sampledAtMs: playbackValue.sampledAtMs,
              nowMs,
              bpm: bpmRef.current,
              baseCameraMode: "normal",
              shouldReduceMotion,
            })
          : null;
      const syncCue = syncMotion?.syncCue ?? null;
      const audioCue =
        modeValue === "sync" &&
        playbackValue.isPlaying &&
        analyser &&
        frequencyData &&
        audioSyncRef.current.status === "active"
          ? (() => {
              analyser.getByteFrequencyData(frequencyData);

              const levels = measureBwCircleFrequencyLevels(frequencyData);
              const nextCue = createBwCircleAudioCue({
                energy: levels.energy,
                bassEnergy: levels.bassEnergy,
                energyBaseline: audioEnergyBaselineRef.current,
                bassEnergyBaseline: bassAudioEnergyBaselineRef.current,
                previousEnergy: previousAudioEnergyRef.current,
                previousBassEnergy: previousBassAudioEnergyRef.current,
                shouldReduceMotion,
              });

              previousAudioEnergyRef.current = levels.energy;
              previousBassAudioEnergyRef.current = levels.bassEnergy;
              audioEnergyBaselineRef.current +=
                (levels.energy - audioEnergyBaselineRef.current) *
                AUDIO_BASELINE_BLEND;
              bassAudioEnergyBaselineRef.current +=
                (levels.bassEnergy - bassAudioEnergyBaselineRef.current) *
                AUDIO_BASELINE_BLEND;

              return nextCue;
            })()
          : null;

      if (
        modeValue !== "sync" ||
        !playbackValue.isPlaying ||
        audioSyncRef.current.status !== "active"
      ) {
        resetEstimatedBpm();
      }

      const baseMotion = createBwCircleAudioBaseMotion({
        audioControlsAccentMotion:
          modeValue === "sync" &&
          playbackValue.isPlaying &&
          audioSyncRef.current.status === "active" &&
          analyser !== null &&
          frequencyData !== null,
        syncCue,
        syncMotion,
      });
      const reactiveMotion =
        modeValue === "sync"
          ? createBwCircleAudioReactiveMotion({
              audioCue,
              baseMotion,
              previousMotion: audioReactiveMotionRef.current,
              shouldReduceMotion,
            })
          : null;

      audioReactiveMotionRef.current =
        modeValue === "sync" ? reactiveMotion : null;

      const syncEnergy = reactiveMotion?.syncEnergy ?? baseMotion.syncEnergy;
      const syncPulse = reactiveMotion?.syncPulse ?? baseMotion.syncPulse;
      const syncSeconds =
        (((syncMotion?.predictedCurrentTime ?? playbackValue.currentTime) % 60) + 60) %
        60;
      const syncAngle =
        createMimesisCue({ secondsWithinMinute: syncSeconds }).angle +
        (modeValue === "sync" ? (syncPulse - 0.5) * 0.1 : 0);
      const angle =
        modeValue === "sync" && playbackValue.isPlaying ? syncAngle : mimesisCue.angle;
      const gravity =
        layout.gravity *
        (modeValue === "sync" && playbackValue.isPlaying
          ? shouldReduceMotion
            ? 1
            : 0.9 + syncEnergy * 0.25
          : 1);
      const bounce =
        layout.bounce +
        (modeValue === "sync" && playbackValue.isPlaying && !shouldReduceMotion
          ? (syncEnergy - 0.35) * 0.05
          : 0);
      const speedBoost =
        modeValue === "sync" && playbackValue.isPlaying && !shouldReduceMotion
          ? 0.92 + syncEnergy * 0.16
          : 1;
      const ballKick =
        modeValue === "sync" ? (reactiveMotion?.ballKick ?? baseMotion.ballKick) : 1;
      const ballSquash =
        modeValue === "sync"
          ? (reactiveMotion?.ballSquash ?? baseMotion.ballSquash)
          : 0;
      const particleAccent =
        modeValue === "sync"
          ? (reactiveMotion?.particleAccent ?? baseMotion.particleAccent)
          : 1;
      const diagonal = Math.hypot(width, height);

      const leftBallImpact = updateBall({
        angle,
        ball: sceneState.leftBall,
        ballRadius,
        beatKick: ballKick,
        beatSquash: ballSquash,
        bounce,
        circleRadius: layout.circleRadius,
        gravity,
        isLeftSide: true,
        speedBoost,
      });
      const rightBallImpact = updateBall({
        angle,
        ball: sceneState.rightBall,
        ballRadius,
        beatKick: ballKick,
        beatSquash: ballSquash,
        bounce,
        circleRadius: layout.circleRadius,
        gravity,
        isLeftSide: false,
        speedBoost,
      });
      releaseImpactParticles({
        circleRadius: layout.circleRadius,
        color: "#ffffff",
        impact: leftBallImpact,
        particles: sceneState.leftParticles,
        splashParticles: sceneState.splashParticles,
      });
      releaseImpactParticles({
        circleRadius: layout.circleRadius,
        color: "#000000",
        impact: rightBallImpact,
        particles: sceneState.rightParticles,
        splashParticles: sceneState.splashParticles,
      });
      sceneState.leftDividerLeakCooldown = updateParticles({
        angle,
        ball: sceneState.leftBall,
        circleRadius: layout.circleRadius,
        dividerLeakCooldown: sceneState.leftDividerLeakCooldown,
        isRightHalf: false,
        particleAccent,
        particles: sceneState.leftParticles,
        splashColor: "#ffffff",
        splashParticles: sceneState.splashParticles,
      });
      sceneState.rightDividerLeakCooldown = updateParticles({
        angle,
        ball: sceneState.rightBall,
        circleRadius: layout.circleRadius,
        dividerLeakCooldown: sceneState.rightDividerLeakCooldown,
        isRightHalf: true,
        particleAccent,
        particles: sceneState.rightParticles,
        splashColor: "#000000",
        splashParticles: sceneState.splashParticles,
      });
      updateSplashParticles({
        circleRadius: layout.circleRadius,
        sceneHeight: height,
        sceneWidth: width,
        splashParticles: sceneState.splashParticles,
      });

      context.clearRect(0, 0, width, height);

      context.save();
      context.translate(width / 2, height / 2);
      context.rotate(angle);
      context.fillStyle = "#000000";
      context.fillRect(-diagonal, -diagonal, diagonal, diagonal * 2);
      context.fillStyle = "#ffffff";
      context.fillRect(0, -diagonal, diagonal, diagonal * 2);
      context.restore();

      context.save();
      context.translate(width / 2, height / 2);
      context.beginPath();
      context.arc(0, 0, layout.circleRadius, 0, Math.PI * 2);
      context.clip();
      context.rotate(angle);
      context.fillStyle = "#ffffff";
      context.fillRect(-diagonal, -diagonal, diagonal, diagonal * 2);
      context.fillStyle = "#000000";
      context.fillRect(0, -diagonal, diagonal, diagonal * 2);
      context.restore();

      context.save();
      context.translate(width / 2, height / 2);
      context.beginPath();
      context.arc(0, 0, layout.circleRadius, 0, Math.PI * 2);
      context.clip();
      context.beginPath();
      context.fillStyle = "#ffffff";
      for (const particle of sceneState.rightParticles) {
        context.moveTo(particle.x + particle.radius, particle.y);
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      }
      context.fill();
      context.beginPath();
      context.fillStyle = "#000000";
      for (const particle of sceneState.leftParticles) {
        context.moveTo(particle.x + particle.radius, particle.y);
        context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      }
      context.fill();
      drawBall(context, sceneState.leftBall, ballRadius);
      drawBall(context, sceneState.rightBall, ballRadius);
      context.restore();

      for (const particle of sceneState.splashParticles) {
        context.globalAlpha = particle.life;
        context.beginPath();
        context.arc(
          width / 2 + particle.x,
          height / 2 + particle.y,
          particle.radius,
          0,
          Math.PI * 2,
        );
        context.fillStyle = particle.color;
        context.fill();
      }
      context.globalAlpha = 1;

      animationFrame = window.requestAnimationFrame(render);
    };

    resize();
    window.addEventListener("resize", resize);
    animationFrame = window.requestAnimationFrame(render);

    return () => {
      resetEstimatedBpm();
      window.removeEventListener("resize", resize);
      window.cancelAnimationFrame(animationFrame);
    };
  }, [playbackRef, shouldReduceMotion]);

  return (
    <div className={styles.sceneShell} data-scene-mode={mode}>
      {syncOverlay ? syncOverlay : null}
      <canvas
        aria-label="Black and white circle canvas"
        className={styles.canvas}
        ref={canvasRef}
      />
    </div>
  );
}
