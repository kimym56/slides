import { clamp, stepPhaseToward } from "./wiperMath";

export function syncAutoplayAngle(phase: number): number {
  return Math.asin(clamp(phase, 0, 1));
}

export function stepInteractivePhase(
  current: number,
  target: number,
  maxDelta: number
): number {
  return stepPhaseToward(current, target, maxDelta);
}

export function stepIdlePhase(autoPhaseAngle: number, speed: number): {
  autoPhaseAngle: number;
  phase: number;
} {
  const nextAngle = autoPhaseAngle + speed;

  return {
    autoPhaseAngle: nextAngle,
    phase: Math.abs(Math.sin(nextAngle)),
  };
}
