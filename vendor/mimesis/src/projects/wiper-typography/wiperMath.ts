import {
  WIPER_MAX_BAR_DEPTH,
  WIPER_MAX_GLYPH_FIELD_DEPTH,
  WIPER_MAX_STAGE_CAMERA_OFFSET,
} from "./wiperConfig";

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export const WIPER_MARGIN = 100;

export function mapPointerXToPhase(
  pointerX: number,
  width: number,
  margin = WIPER_MARGIN
): number {
  const usableWidth = width - margin * 2;
  if (usableWidth <= 0) {
    return 0;
  }

  const clampedX = clamp(pointerX, margin, width - margin);
  return (clampedX - margin) / usableWidth;
}

export function mapPointerDragToPhase(
  pointerX: number,
  dragStartX: number,
  dragStartPhase: number,
  width: number,
  margin = WIPER_MARGIN
): number {
  const usableWidth = width - margin * 2;
  if (usableWidth <= 0) {
    return clamp(dragStartPhase, 0, 1);
  }

  const phaseDelta = (pointerX - dragStartX) / usableWidth;
  return clamp(dragStartPhase + phaseDelta, 0, 1);
}

export function stepPhaseToward(
  currentPhase: number,
  targetPhase: number,
  maxDelta: number
): number {
  const safeCurrent = clamp(currentPhase, 0, 1);
  const safeTarget = clamp(targetPhase, 0, 1);
  const safeMaxDelta = Math.max(0, maxDelta);
  const delta = safeTarget - safeCurrent;

  if (Math.abs(delta) <= safeMaxDelta) {
    return safeTarget;
  }

  return clamp(safeCurrent + Math.sign(delta) * safeMaxDelta, 0, 1);
}

export function isPointerInsideActiveRange(
  pointerX: number,
  width: number,
  margin = WIPER_MARGIN
): boolean {
  return pointerX >= margin && pointerX <= width - margin;
}

export function computeLineCount(
  height: number,
  segmentWidth: number,
  overscan = 1.2
): number {
  if (height <= 0 || segmentWidth <= 0) {
    return 0;
  }

  return Math.floor((height / segmentWidth) * overscan);
}

export function computeLineDimensions(
  index: number,
  width: number
): { width: number; height: number } {
  return {
    width,
    height: width - 0.2 * index,
  };
}

export function computeBarDepth(index: number): number {
  return clamp(WIPER_MAX_BAR_DEPTH - index * 0.0015, 0.06, WIPER_MAX_BAR_DEPTH);
}

export function computeGlyphLayerDepth(
  index: number,
  totalLayers: number
): number {
  if (totalLayers <= 1) {
    return 0;
  }

  const normalized = index / (totalLayers - 1);
  return (normalized * 2 - 1) * WIPER_MAX_GLYPH_FIELD_DEPTH;
}

export function computeStageCameraOffset(phase: number): { x: number; y: number } {
  const normalizedPhase = clamp(phase, 0, 1);

  return {
    x: (normalizedPhase * 2 - 1) * WIPER_MAX_STAGE_CAMERA_OFFSET,
    y:
      (0.5 - Math.abs(normalizedPhase - 0.5)) *
      WIPER_MAX_STAGE_CAMERA_OFFSET *
      0.35,
  };
}

export function computeLinePose(
  index: number,
  phase: number,
  width: number,
  height: number,
  segmentWidth: number
): { x: number; y: number; rotation: number } {
  const theta = phase * Math.PI;
  const distance = -(segmentWidth - 2) * index;

  return {
    x: Math.cos(theta) * distance + width / 2,
    y: Math.sin(theta) * distance + height + segmentWidth,
    rotation: theta,
  };
}
