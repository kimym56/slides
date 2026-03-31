export function getDriverViewCycleDuration(reducedMotion: boolean) {
  return reducedMotion ? 8 : 4.8;
}

export function computeDriverViewPhase(
  elapsedSeconds: number,
  cycleDuration: number
) {
  const safeCycleDuration = Math.max(cycleDuration, 0.001);
  const elapsedWithinCycle =
    ((elapsedSeconds % safeCycleDuration) + safeCycleDuration) %
    safeCycleDuration;
  const normalizedElapsed = elapsedWithinCycle / safeCycleDuration;

  return 1 - Math.abs(normalizedElapsed * 2 - 1);
}
