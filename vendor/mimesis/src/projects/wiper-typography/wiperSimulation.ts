import {
  WIPER_COLLISION_PUSH,
  WIPER_GLYPHS,
  WIPER_GLYPH_ROTATION_STEP,
  WIPER_GLYPH_SIZE,
  WIPER_GLYPH_SPAWN_Y,
  WIPER_LINE_WIDTH,
  WIPER_PARTICLE_BUDGET,
  WIPER_PARTICLE_FRICTION,
  WIPER_PARTICLE_GRAVITY,
  WIPER_PARTICLE_INITIAL_VELOCITY,
} from "./wiperConfig";
import {
  computeLineCount,
  computeLineDimensions,
  computeLinePose,
} from "./wiperMath";

export interface WiperGlyphState {
  kind: "glyph";
  index: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  text: string;
}

export interface WiperBarState {
  kind: "bar";
  index: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  rotation: number;
  width: number;
  height: number;
}

interface WiperSimulationEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export interface WiperSimulationState {
  width: number;
  height: number;
  lineWidth: number;
  glyphs: WiperGlyphState[];
  bars: WiperBarState[];
  random: () => number;
}

interface CreateWiperSimulationStateOptions {
  width: number;
  height: number;
  lineWidth?: number;
  particleCount: number;
  phase?: number;
  random?: () => number;
}

interface ParticleCountOptions {
  coarsePointer: boolean;
  isIpad: boolean;
}

function randomInt(random: () => number, min: number, max: number) {
  return Math.floor(random() * (max - min + 1)) + min;
}

function createGlyph(index: number, scene: WiperSimulationState): WiperGlyphState {
  const glyph: WiperGlyphState = {
    kind: "glyph",
    index,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    radius: WIPER_GLYPH_SIZE * 0.5,
    rotation: 0,
    text: WIPER_GLYPHS[0] ?? "",
  };

  resetGlyph(glyph, scene);
  return glyph;
}

function resetGlyph(glyph: WiperGlyphState, scene: WiperSimulationState) {
  glyph.x = randomInt(scene.random, 0, scene.width);
  glyph.y = WIPER_GLYPH_SPAWN_Y;
  glyph.vx =
    scene.random() * (WIPER_PARTICLE_INITIAL_VELOCITY * 2) -
    WIPER_PARTICLE_INITIAL_VELOCITY;
  glyph.vy =
    scene.random() * (WIPER_PARTICLE_INITIAL_VELOCITY * 2) -
    WIPER_PARTICLE_INITIAL_VELOCITY;
  glyph.rotation = 0;
  glyph.text =
    WIPER_GLYPHS[randomInt(scene.random, 0, WIPER_GLYPHS.length - 1)] ?? "";
}

function createBar(
  index: number,
  scene: WiperSimulationState,
  phase: number
): WiperBarState {
  const dimensions = computeLineDimensions(index, scene.lineWidth);
  const pose = computeLinePose(
    index,
    phase,
    scene.width,
    scene.height,
    scene.lineWidth
  );

  return {
    kind: "bar",
    index,
    x: pose.x,
    y: pose.y,
    vx: 0,
    vy: 0,
    radius: dimensions.width * 0.5,
    rotation: pose.rotation,
    width: dimensions.width,
    height: dimensions.height,
  };
}

function updateBarPose(
  bar: WiperBarState,
  scene: WiperSimulationState,
  phase: number
) {
  const dimensions = computeLineDimensions(bar.index, scene.lineWidth);
  const pose = computeLinePose(
    bar.index,
    phase,
    scene.width,
    scene.height,
    scene.lineWidth
  );

  bar.x = pose.x;
  bar.y = pose.y;
  bar.vx = 0;
  bar.vy = 0;
  bar.radius = dimensions.width * 0.5;
  bar.rotation = pose.rotation;
  bar.width = dimensions.width;
  bar.height = dimensions.height;
}

function moveGlyph(glyph: WiperGlyphState, scene: WiperSimulationState) {
  glyph.rotation += WIPER_GLYPH_ROTATION_STEP;
  glyph.vx *= WIPER_PARTICLE_FRICTION;
  glyph.vy *= WIPER_PARTICLE_FRICTION;
  glyph.vy += WIPER_PARTICLE_GRAVITY;
  glyph.x += glyph.vx;
  glyph.y += glyph.vy;

  if (glyph.x - glyph.radius > scene.width || glyph.x + glyph.radius < 0) {
    resetGlyph(glyph, scene);
    return;
  }

  if (glyph.y - glyph.radius > scene.height) {
    resetGlyph(glyph, scene);
  }
}

function applyCollisions(scene: WiperSimulationState) {
  const entities: WiperSimulationEntity[] = [...scene.glyphs, ...scene.bars];

  for (let currentIndex = 0; currentIndex < entities.length - 1; currentIndex += 1) {
    const current = entities[currentIndex];
    if (!current) {
      continue;
    }

    for (
      let targetIndex = currentIndex + 1;
      targetIndex < entities.length;
      targetIndex += 1
    ) {
      const target = entities[targetIndex];
      if (!target) {
        continue;
      }

      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const radiusSum = current.radius + target.radius;

      if (distance >= radiusSum || distance === 0) {
        continue;
      }

      const angle = Math.atan2(dy, dx);
      const nextX = current.x + Math.cos(angle) * radiusSum;
      const nextY = current.y + Math.sin(angle) * radiusSum;
      const impulseX = WIPER_COLLISION_PUSH * (nextX - target.x);
      const impulseY = WIPER_COLLISION_PUSH * (nextY - target.y);

      current.vx -= impulseX;
      current.vy -= impulseY;
      target.vx += impulseX;
      target.vy += impulseY;
    }
  }
}

export function selectWiperParticleCount({
  coarsePointer,
  isIpad,
}: ParticleCountOptions): number {
  if (!coarsePointer) {
    return WIPER_PARTICLE_BUDGET.desktop;
  }

  return isIpad ? WIPER_PARTICLE_BUDGET.tablet : WIPER_PARTICLE_BUDGET.mobile;
}

export function detectWiperParticleCount(): number {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return WIPER_PARTICLE_BUDGET.desktop;
  }

  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const isIpad =
    /iPad/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  return selectWiperParticleCount({ coarsePointer, isIpad });
}

export function createWiperSimulationState({
  width,
  height,
  lineWidth = WIPER_LINE_WIDTH,
  particleCount,
  phase = 0,
  random = Math.random,
}: CreateWiperSimulationStateOptions): WiperSimulationState {
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);

  const scene: WiperSimulationState = {
    width: safeWidth,
    height: safeHeight,
    lineWidth,
    glyphs: [],
    bars: [],
    random,
  };

  for (let index = 0; index < particleCount; index += 1) {
    scene.glyphs.push(createGlyph(index, scene));
  }

  const lineCount = computeLineCount(safeHeight, lineWidth);
  for (let index = 0; index < lineCount; index += 1) {
    scene.bars.push(createBar(index, scene, phase));
  }

  return scene;
}

export function stepWiperSimulationState(
  scene: WiperSimulationState,
  phase: number
) {
  for (const bar of scene.bars) {
    updateBarPose(bar, scene, phase);
  }

  applyCollisions(scene);

  for (const glyph of scene.glyphs) {
    moveGlyph(glyph, scene);
  }
}
