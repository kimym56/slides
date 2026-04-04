import { Matrix4 } from "three/src/math/Matrix4.js";
import { Quaternion } from "three/src/math/Quaternion.js";
import { Vector3 } from "three/src/math/Vector3.js";
import {
  DEFAULT_TESLA_DRIVER_VIEW_TUNING,
  type TeslaDriverViewTuning,
} from "./wiperTeslaDriverTuning";

type Vec3 = [number, number, number];
type Mat3 = [Vec3, Vec3, Vec3];

export interface TeslaDriverGlyphProjectionInsets {
  insetX: number;
  insetY: number;
}

export interface TeslaDriverViewPlane {
  center: Vec3;
  height: number;
  horizontalAxis: Vec3;
  normalAxis: Vec3;
  verticalAxis: Vec3;
  width: number;
}

export interface TeslaDriverViewLayoutInput {
  steeringPosition: Vec3;
  windscreenCenter: Vec3;
  windscreenPlane?: TeslaDriverViewPlane;
  windscreenSize: Vec3;
}

export interface TeslaDriverViewLayout {
  cameraPosition: Vec3;
  glyphDepthOffset: number;
  glyphVisibleHeight: number;
  glyphVisibleWidth: number;
  glyphYBias: number;
  horizontalAxis: Vec3;
  lookAt: Vec3;
  normalAxis: Vec3;
  verticalAxis: Vec3;
  windscreenCenter: Vec3;
  windscreenHeight: number;
  windscreenWidth: number;
}

function normalize([x, y, z]: Vec3): Vec3 {
  const length = Math.hypot(x, y, z) || 1;
  return [x / length, y / length, z / length];
}

function add([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 {
  return [ax + bx, ay + by, az + bz];
}

function scale([x, y, z]: Vec3, scalar: number): Vec3 {
  return [x * scalar, y * scalar, z * scalar];
}

function cross([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
}

function dot([ax, ay, az]: Vec3, [bx, by, bz]: Vec3) {
  return ax * bx + ay * by + az * bz;
}

function subtract([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 {
  return [ax - bx, ay - by, az - bz];
}

function clampGlyphInset(value: number) {
  return Math.max(0, Math.min(0.49, value));
}

function clampGlyphCoordinate(value: number, inset: number) {
  const clampedInset = clampGlyphInset(inset);
  return Math.min(1 - clampedInset, Math.max(clampedInset, value));
}

function projectOntoPlane(axis: Vec3, normalAxis: Vec3): Vec3 {
  return subtract(axis, scale(normalAxis, dot(axis, normalAxis)));
}

function squaredLength([x, y, z]: Vec3) {
  return x * x + y * y + z * z;
}

function createIdentityMat3(): Mat3 {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
}

function cloneMat3(matrix: Mat3): Mat3 {
  return [
    [...matrix[0]] as Vec3,
    [...matrix[1]] as Vec3,
    [...matrix[2]] as Vec3,
  ];
}

function diagonalizeSymmetricMat3(matrix: Mat3) {
  const diagonalized = cloneMat3(matrix);
  const eigenvectors = createIdentityMat3();

  for (let iteration = 0; iteration < 32; iteration += 1) {
    let row = 0;
    let column = 1;
    let largestOffDiagonal = Math.abs(diagonalized[row][column]);

    for (const [candidateRow, candidateColumn] of [[0, 2], [1, 2]] as const) {
      const candidateValue = Math.abs(
        diagonalized[candidateRow][candidateColumn]
      );

      if (candidateValue > largestOffDiagonal) {
        row = candidateRow;
        column = candidateColumn;
        largestOffDiagonal = candidateValue;
      }
    }

    if (largestOffDiagonal < 1e-10) {
      break;
    }

    const theta =
      0.5 *
      Math.atan2(
        2 * diagonalized[row][column],
        diagonalized[column][column] - diagonalized[row][row]
      );
    const cosine = Math.cos(theta);
    const sine = Math.sin(theta);

    for (let index = 0; index < 3; index += 1) {
      const left = diagonalized[index][row];
      const right = diagonalized[index][column];

      diagonalized[index][row] = cosine * left - sine * right;
      diagonalized[index][column] = sine * left + cosine * right;
    }

    for (let index = 0; index < 3; index += 1) {
      const top = diagonalized[row][index];
      const bottom = diagonalized[column][index];

      diagonalized[row][index] = cosine * top - sine * bottom;
      diagonalized[column][index] = sine * top + cosine * bottom;
    }

    for (let index = 0; index < 3; index += 1) {
      const left = eigenvectors[index][row];
      const right = eigenvectors[index][column];

      eigenvectors[index][row] = cosine * left - sine * right;
      eigenvectors[index][column] = sine * left + cosine * right;
    }
  }

  return [
    {
      value: diagonalized[0][0],
      vector: normalize([
        eigenvectors[0][0],
        eigenvectors[1][0],
        eigenvectors[2][0],
      ]),
    },
    {
      value: diagonalized[1][1],
      vector: normalize([
        eigenvectors[0][1],
        eigenvectors[1][1],
        eigenvectors[2][1],
      ]),
    },
    {
      value: diagonalized[2][2],
      vector: normalize([
        eigenvectors[0][2],
        eigenvectors[1][2],
        eigenvectors[2][2],
      ]),
    },
  ].sort((left, right) => right.value - left.value);
}

export function createTeslaDriverGlyphProjectionInsets({
  glyphRadius,
  pixelHeight,
  pixelWidth,
}: {
  glyphRadius: number;
  pixelHeight: number;
  pixelWidth: number;
}): TeslaDriverGlyphProjectionInsets {
  const safeGlyphRadius = Math.max(0, glyphRadius);

  return {
    insetX: clampGlyphInset(safeGlyphRadius / Math.max(pixelWidth, 1)),
    insetY: clampGlyphInset(safeGlyphRadius / Math.max(pixelHeight, 1)),
  };
}

function createApproximateTeslaDriverViewPlane({
  windscreenCenter,
  windscreenSize,
}: Pick<TeslaDriverViewLayoutInput, "windscreenCenter" | "windscreenSize">): TeslaDriverViewPlane {
  const horizontalAxis: Vec3 = [1, 0, 0];
  const verticalAxis = normalize([
    0,
    Math.max(windscreenSize[1], 0.001),
    -Math.max(windscreenSize[2] * 0.92, windscreenSize[1] * 0.4),
  ]);
  const initialNormalAxis = normalize(cross(horizontalAxis, verticalAxis));
  const normalAxis =
    initialNormalAxis[2] >= 0
      ? initialNormalAxis
      : scale(initialNormalAxis, -1);

  return {
    center: windscreenCenter,
    height: Math.hypot(windscreenSize[1], windscreenSize[2]),
    horizontalAxis,
    normalAxis,
    verticalAxis,
    width: windscreenSize[0],
  };
}

export function createTeslaDriverViewPlane({
  axisX,
  axisY,
  axisZ,
  center,
  driverPosition,
  extents,
}: {
  axisX: Vec3;
  axisY: Vec3;
  axisZ: Vec3;
  center: Vec3;
  driverPosition: Vec3;
  extents: Vec3;
}): TeslaDriverViewPlane {
  const candidates = [
    { axis: normalize(axisX), extent: Math.abs(extents[0]) },
    { axis: normalize(axisY), extent: Math.abs(extents[1]) },
    { axis: normalize(axisZ), extent: Math.abs(extents[2]) },
  ];
  const thicknessCandidate =
    candidates.reduce((smallest, current) =>
      current.extent < smallest.extent ? current : smallest
    );
  const planeCandidates = candidates.filter((candidate) => candidate !== thicknessCandidate);
  let normalAxis = thicknessCandidate.axis;
  const toDriver = subtract(driverPosition, center);

  if (dot(normalAxis, toDriver) < 0) {
    normalAxis = scale(normalAxis, -1);
  }

  const [candidateA, candidateB] = planeCandidates;
  let horizontalCandidate =
    Math.abs(candidateA?.axis[0] ?? 0) >= Math.abs(candidateB?.axis[0] ?? 0)
      ? candidateA
      : candidateB;
  const verticalCandidate =
    horizontalCandidate === candidateA ? candidateB : candidateA;
  let horizontalAxis = horizontalCandidate?.axis ?? [1, 0, 0];

  if (horizontalAxis[0] < 0) {
    horizontalAxis = scale(horizontalAxis, -1);
  }

  let verticalAxis = normalize(cross(normalAxis, horizontalAxis));

  if (verticalAxis[1] < 0) {
    horizontalAxis = scale(horizontalAxis, -1);
    verticalAxis = normalize(cross(normalAxis, horizontalAxis));
    horizontalCandidate = horizontalCandidate === candidateA ? candidateA : candidateB;
  }

  return {
    center,
    height: verticalCandidate?.extent ?? 1,
    horizontalAxis,
    normalAxis,
    verticalAxis,
    width: horizontalCandidate?.extent ?? 1,
  };
}

export function createTeslaDriverViewPlaneFromPoints({
  driverPosition,
  horizontalReferenceAxis = [1, 0, 0],
  points,
}: {
  driverPosition: Vec3;
  horizontalReferenceAxis?: Vec3;
  points: Vec3[];
}): TeslaDriverViewPlane | undefined {
  if (points.length < 3) {
    return undefined;
  }

  const center = points.reduce<Vec3>(
    (accumulator, point) => add(accumulator, point),
    [0, 0, 0]
  ).map((value) => value / points.length) as Vec3;
  const covariance: Mat3 = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];

  for (const point of points) {
    const [dx, dy, dz] = subtract(point, center);

    covariance[0][0] += dx * dx;
    covariance[0][1] += dx * dy;
    covariance[0][2] += dx * dz;
    covariance[1][0] += dy * dx;
    covariance[1][1] += dy * dy;
    covariance[1][2] += dy * dz;
    covariance[2][0] += dz * dx;
    covariance[2][1] += dz * dy;
    covariance[2][2] += dz * dz;
  }

  const [dominantAxis, secondaryAxis, smallestAxis] =
    diagonalizeSymmetricMat3(covariance);
  let normalAxis = smallestAxis.vector;
  const toDriver = subtract(driverPosition, center);

  if (dot(normalAxis, toDriver) > 0) {
    normalAxis = scale(normalAxis, -1);
  }

  const horizontalCandidates = [
    horizontalReferenceAxis,
    dominantAxis.vector,
    secondaryAxis.vector,
    [0, 1, 0] as Vec3,
    [0, 0, 1] as Vec3,
  ];
  let horizontalAxis =
    horizontalCandidates
      .map((axis) => projectOntoPlane(axis, normalAxis))
      .find((axis) => squaredLength(axis) > 1e-8) ?? [1, 0, 0];

  horizontalAxis = normalize(horizontalAxis);

  if (horizontalAxis[0] < 0) {
    horizontalAxis = scale(horizontalAxis, -1);
  }

  let verticalAxis = normalize(cross(normalAxis, horizontalAxis));

  if (verticalAxis[1] < 0) {
    horizontalAxis = scale(horizontalAxis, -1);
    verticalAxis = normalize(cross(normalAxis, horizontalAxis));
  }

  let minHorizontal = Infinity;
  let maxHorizontal = -Infinity;
  let minVertical = Infinity;
  let maxVertical = -Infinity;

  for (const point of points) {
    const pointOffset = subtract(point, center);
    const horizontalOffset = dot(pointOffset, horizontalAxis);
    const verticalOffset = dot(pointOffset, verticalAxis);

    minHorizontal = Math.min(minHorizontal, horizontalOffset);
    maxHorizontal = Math.max(maxHorizontal, horizontalOffset);
    minVertical = Math.min(minVertical, verticalOffset);
    maxVertical = Math.max(maxVertical, verticalOffset);
  }

  return {
    center,
    height: maxVertical - minVertical,
    horizontalAxis,
    normalAxis,
    verticalAxis,
    width: maxHorizontal - minHorizontal,
  };
}

export function createTeslaDriverViewLayout({
  steeringPosition,
  windscreenCenter,
  windscreenPlane,
  windscreenSize,
}: TeslaDriverViewLayoutInput,
  tuning: TeslaDriverViewTuning = DEFAULT_TESLA_DRIVER_VIEW_TUNING
): TeslaDriverViewLayout {
  const plane =
    windscreenPlane ??
    createApproximateTeslaDriverViewPlane({
      windscreenCenter,
      windscreenSize,
    });
  const horizontalAxis = plane.horizontalAxis;
  const verticalAxis = plane.verticalAxis;
  const normalAxis = plane.normalAxis;
  const windscreenWidth = plane.width * tuning.windscreenWidthScale;
  const windscreenHeight = plane.height * tuning.windscreenHeightScale;
  const adjustedWindscreenCenter = add(
    plane.center,
    add(
      scale(horizontalAxis, windscreenWidth * tuning.windscreenCenterOffsetX),
      add(
        scale(verticalAxis, windscreenHeight * tuning.windscreenCenterOffsetY),
        scale(normalAxis, tuning.windscreenCenterOffsetNormal)
      )
    )
  );

  return {
    cameraPosition: add(steeringPosition, [
      tuning.cameraOffsetX,
      tuning.cameraOffsetY,
      tuning.cameraOffsetZ,
    ]),
    glyphDepthOffset: tuning.glyphDepthOffset,
    glyphVisibleHeight: windscreenHeight * tuning.glyphHeightScale,
    glyphVisibleWidth: windscreenWidth * tuning.glyphWidthScale,
    glyphYBias: tuning.glyphYBias,
    horizontalAxis,
    lookAt: add(
      plane.center,
      add(
        scale(horizontalAxis, windscreenWidth * tuning.lookAtOffsetX),
        add(
          scale(verticalAxis, windscreenHeight * tuning.lookAtOffsetY),
          scale(normalAxis, tuning.lookAtOffsetZ)
        )
      )
    ),
    normalAxis,
    verticalAxis,
    windscreenCenter: adjustedWindscreenCenter,
    windscreenHeight,
    windscreenWidth,
  };
}

export function projectTeslaDriverGlyphPosition(
  layout: TeslaDriverViewLayout,
  normalizedX: number,
  normalizedY: number,
  projectionInsets: TeslaDriverGlyphProjectionInsets = { insetX: 0, insetY: 0 }
): Vec3 {
  const safeX = clampGlyphCoordinate(normalizedX, projectionInsets.insetX);
  const safeY = clampGlyphCoordinate(normalizedY, projectionInsets.insetY);
  const xOffset = (safeX - 0.5) * layout.glyphVisibleWidth;
  const yOffset = (layout.glyphYBias - safeY) * layout.glyphVisibleHeight;

  return add(
    layout.windscreenCenter,
    add(
      scale(layout.horizontalAxis, xOffset),
      add(
        scale(layout.verticalAxis, yOffset),
        scale(layout.normalAxis, layout.glyphDepthOffset)
      )
    )
  );
}

export function createTeslaDriverGlyphQuaternion(
  layout: Pick<TeslaDriverViewLayout, "horizontalAxis" | "normalAxis" | "verticalAxis">,
  rotationZ: number
) {
  const basisMatrix = new Matrix4().makeBasis(
    new Vector3(...layout.horizontalAxis),
    new Vector3(...layout.verticalAxis),
    new Vector3(...layout.normalAxis)
  );
  const planeQuaternion = new Quaternion().setFromRotationMatrix(basisMatrix);
  const spinQuaternion = new Quaternion().setFromAxisAngle(
    new Vector3(0, 0, 1),
    rotationZ
  );

  return planeQuaternion.multiply(spinQuaternion);
}

export function getTeslaDriverWiperRotation(phase: number) {
  const clampedPhase = Math.max(0, Math.min(1, phase));
  return 0.82 + clampedPhase * 0.48;
}
