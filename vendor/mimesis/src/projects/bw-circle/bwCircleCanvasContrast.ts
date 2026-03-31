export type BwCircleContrastTone = "dark" | "light";

interface BwCircleRectLike {
  bottom: number;
  height: number;
  left: number;
  right: number;
  top: number;
  width: number;
}

interface SampleBwCircleCanvasContrastToneOptions {
  canvasHeight: number;
  canvasRect: BwCircleRectLike;
  canvasWidth: number;
  previousTone?: BwCircleContrastTone | null;
  readPixel: (x: number, y: number) => Uint8ClampedArray | null;
  targetRect: BwCircleRectLike;
}

const BASE_LUMINANCE_THRESHOLD = 0.52;
const LIGHT_TO_DARK_THRESHOLD = 0.58;
const DARK_TO_LIGHT_THRESHOLD = 0.46;
const SAMPLE_COLUMNS = 3;
const SAMPLE_ROWS = 3;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function measurePixelLuminance(pixel: Uint8ClampedArray) {
  const alpha = (pixel[3] ?? 255) / 255;

  if (alpha <= 0) {
    return null;
  }

  const red = pixel[0] ?? 0;
  const green = pixel[1] ?? 0;
  const blue = pixel[2] ?? 0;

  return (
    ((0.2126 * red + 0.7152 * green + 0.0722 * blue) / 255) * alpha
  );
}

export function determineBwCircleContrastTone(
  averageLuminance: number,
  previousTone: BwCircleContrastTone | null = null,
): BwCircleContrastTone {
  if (previousTone === "light") {
    return averageLuminance >= LIGHT_TO_DARK_THRESHOLD ? "dark" : "light";
  }

  if (previousTone === "dark") {
    return averageLuminance <= DARK_TO_LIGHT_THRESHOLD ? "light" : "dark";
  }

  return averageLuminance >= BASE_LUMINANCE_THRESHOLD ? "dark" : "light";
}

export function sampleBwCircleCanvasContrastTone({
  canvasHeight,
  canvasRect,
  canvasWidth,
  previousTone = null,
  readPixel,
  targetRect,
}: SampleBwCircleCanvasContrastToneOptions): BwCircleContrastTone | null {
  if (
    canvasWidth <= 0 ||
    canvasHeight <= 0 ||
    canvasRect.width <= 0 ||
    canvasRect.height <= 0
  ) {
    return null;
  }

  const overlapLeft = Math.max(targetRect.left, canvasRect.left);
  const overlapRight = Math.min(targetRect.right, canvasRect.right);
  const overlapTop = Math.max(targetRect.top, canvasRect.top);
  const overlapBottom = Math.min(targetRect.bottom, canvasRect.bottom);

  if (overlapRight <= overlapLeft || overlapBottom <= overlapTop) {
    return null;
  }

  let luminanceTotal = 0;
  let luminanceSamples = 0;

  for (let row = 0; row < SAMPLE_ROWS; row += 1) {
    const sampleY =
      overlapTop +
      ((row + 0.5) * (overlapBottom - overlapTop)) / SAMPLE_ROWS;

    for (let column = 0; column < SAMPLE_COLUMNS; column += 1) {
      const sampleX =
        overlapLeft +
        ((column + 0.5) * (overlapRight - overlapLeft)) / SAMPLE_COLUMNS;

      const canvasX = clamp(
        Math.round(((sampleX - canvasRect.left) / canvasRect.width) * (canvasWidth - 1)),
        0,
        canvasWidth - 1,
      );
      const canvasY = clamp(
        Math.round(((sampleY - canvasRect.top) / canvasRect.height) * (canvasHeight - 1)),
        0,
        canvasHeight - 1,
      );
      const pixel = readPixel(canvasX, canvasY);

      if (!pixel) {
        continue;
      }

      const luminance = measurePixelLuminance(pixel);

      if (luminance === null) {
        continue;
      }

      luminanceTotal += luminance;
      luminanceSamples += 1;
    }
  }

  if (luminanceSamples === 0) {
    return null;
  }

  return determineBwCircleContrastTone(
    luminanceTotal / luminanceSamples,
    previousTone,
  );
}

export function readBwCircleCanvasContrastTone({
  canvas,
  previousTone = null,
  targetRect,
}: {
  canvas: HTMLCanvasElement;
  previousTone?: BwCircleContrastTone | null;
  targetRect: DOMRect;
}): BwCircleContrastTone | null {
  try {
    const context = canvas.getContext("2d");

    if (!context) {
      return null;
    }

    return sampleBwCircleCanvasContrastTone({
      canvasHeight: canvas.height,
      canvasRect: canvas.getBoundingClientRect(),
      canvasWidth: canvas.width,
      previousTone,
      readPixel: (x, y) => context.getImageData(x, y, 1, 1).data,
      targetRect,
    });
  } catch {
    return null;
  }
}
