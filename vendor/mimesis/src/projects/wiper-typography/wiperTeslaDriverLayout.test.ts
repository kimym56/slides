import { describe, expect, it } from "vitest";
import { PerspectiveCamera, Vector3 } from "three";
import {
  createTeslaDriverGlyphQuaternion,
  createTeslaDriverViewPlane,
  createTeslaDriverViewPlaneFromPoints,
  createTeslaDriverGlyphProjectionInsets,
  createTeslaDriverViewLayout,
  getTeslaDriverWiperRotation,
  projectTeslaDriverGlyphPosition,
} from "./wiperTeslaDriverLayout";
import {
  clampTeslaDriverViewFov,
  DEFAULT_TESLA_DRIVER_VIEW_TUNING,
  TESLA_DRIVER_VIEW_FOV_RANGE,
} from "./wiperTeslaDriverTuning";

type Vec3 = [number, number, number];

const DRIVER_VIEW_LAYOUT_INPUT = {
  steeringPosition: [-0.47, 0.176, -0.608] as Vec3,
  windscreenCenter: [0, 0.573, -0.729] as Vec3,
  windscreenSize: [1.48, 0.62, 0.84] as Vec3,
};
const TESLA_DRIVER_WIPER_BOUNDS_CENTER = new Vector3(
  0.0521460548043251,
  0.18905576508527283,
  -1.451226122521269
);

function subtract([ax, ay, az]: Vec3, [bx, by, bz]: Vec3): Vec3 {
  return [ax - bx, ay - by, az - bz];
}

function dot([ax, ay, az]: Vec3, [bx, by, bz]: Vec3) {
  return ax * bx + ay * by + az * bz;
}

function axisOffset(point: Vec3, origin: Vec3, axis: Vec3) {
  return dot(subtract(point, origin), axis);
}

function createPlanePointCloud({
  center,
  height,
  horizontalAxis,
  normalAxis,
  thickness,
  verticalAxis,
  width,
}: {
  center: Vec3;
  height: number;
  horizontalAxis: Vec3;
  normalAxis: Vec3;
  thickness: number;
  verticalAxis: Vec3;
  width: number;
}) {
  const points: Vec3[] = [];

  for (const depth of [-0.5, 0.5]) {
    for (let row = 0; row <= 4; row += 1) {
      for (let column = 0; column <= 4; column += 1) {
        const x = column / 4 - 0.5;
        const y = row / 4 - 0.5;

        points.push([
          center[0] +
            horizontalAxis[0] * width * x +
            verticalAxis[0] * height * y +
            normalAxis[0] * thickness * depth,
          center[1] +
            horizontalAxis[1] * width * x +
            verticalAxis[1] * height * y +
            normalAxis[1] * thickness * depth,
          center[2] +
            horizontalAxis[2] * width * x +
            verticalAxis[2] * height * y +
            normalAxis[2] * thickness * depth,
        ]);
      }
    }
  }

  return points;
}

describe("wiperTeslaDriverLayout", () => {
  it("positions the camera using the approved preset and aims through the main windshield opening", () => {
    const layout = createTeslaDriverViewLayout(DRIVER_VIEW_LAYOUT_INPUT);

    expect(layout.cameraPosition[0]).toBeGreaterThan(-0.35);
    expect(layout.cameraPosition[1]).toBeGreaterThan(0.35);
    expect(layout.cameraPosition[2]).toBeGreaterThan(-0.1);
    expect(layout.lookAt[0]).toBeGreaterThan(0.1);
    expect(layout.lookAt[0] - layout.cameraPosition[0]).toBeGreaterThan(0.35);
    expect(layout.lookAt[2]).toBeLessThan(layout.cameraPosition[2]);
    expect(layout.lookAt[2]).toBeGreaterThan(-0.8);
  });

  it("keeps the animated wiper sweep inside the driver-view frame instead of pinning it to the edge", () => {
    const layout = createTeslaDriverViewLayout(DRIVER_VIEW_LAYOUT_INPUT);
    const camera = new PerspectiveCamera(
      DEFAULT_TESLA_DRIVER_VIEW_TUNING.fov,
      1,
      0.01,
      30
    );

    camera.position.set(...layout.cameraPosition);
    camera.lookAt(...layout.lookAt);
    camera.updateMatrixWorld(true);
    camera.updateProjectionMatrix();

    const projectedCenter = TESLA_DRIVER_WIPER_BOUNDS_CENTER
      .clone()
      .project(camera);

    expect(projectedCenter.x).toBeGreaterThan(-0.7);
    expect(projectedCenter.y).toBeGreaterThan(-0.62);
  });

  it("projects glyphs onto a windshield plane that rises and deepens toward the top", () => {
    const layout = createTeslaDriverViewLayout(DRIVER_VIEW_LAYOUT_INPUT);

    const bottomPoint = projectTeslaDriverGlyphPosition(layout, 0.5, 0.85);
    const topPoint = projectTeslaDriverGlyphPosition(layout, 0.5, 0.15);

    expect(topPoint[1]).toBeGreaterThan(bottomPoint[1]);
    expect(topPoint[2]).toBeLessThan(bottomPoint[2]);
  });

  it("applies custom tuning values to the camera offset and glyph placement", () => {
    const layout = createTeslaDriverViewLayout(
      DRIVER_VIEW_LAYOUT_INPUT,
      {
        ...DEFAULT_TESLA_DRIVER_VIEW_TUNING,
        cameraOffsetZ: 0.32,
        glyphYBias: 0.28,
      }
    );

    const glyphPoint = projectTeslaDriverGlyphPosition(layout, 0.5, 0.2);

    expect(layout.cameraPosition[2]).toBeCloseTo(-0.288, 2);
    expect(glyphPoint[1]).toBeGreaterThan(layout.windscreenCenter[1]);
  });

  it("keeps the wiper sweep around the windshield base instead of spinning freely", () => {
    expect(getTeslaDriverWiperRotation(0)).toBeCloseTo(0.82, 2);
    expect(getTeslaDriverWiperRotation(0.5)).toBeCloseTo(1.06, 2);
  });

  it("derives a flat windshield plane from explicit mesh axes and extents", () => {
    const plane = createTeslaDriverViewPlane({
      axisX: [1, 0, 0],
      axisY: [0, 0.6257776178808467, -0.7800015211263199],
      axisZ: [0, 0.78000152112632, 0.6257776178808468],
      center: DRIVER_VIEW_LAYOUT_INPUT.windscreenCenter,
      driverPosition: DRIVER_VIEW_LAYOUT_INPUT.steeringPosition,
      extents: [1.48, 1.04, 0.05],
    });

    expect(plane.width).toBeCloseTo(1.48, 2);
    expect(plane.height).toBeCloseTo(1.04, 2);
    expect(Math.abs(plane.horizontalAxis[0])).toBeGreaterThan(0.9);
    expect(plane.verticalAxis[1]).toBeGreaterThan(0.5);
    expect(Math.abs(plane.normalAxis[2])).toBeGreaterThan(0.5);
  });

  it("derives a sloped windshield plane from baked geometry points", () => {
    const plane = createTeslaDriverViewPlaneFromPoints({
      driverPosition: DRIVER_VIEW_LAYOUT_INPUT.steeringPosition,
      points: createPlanePointCloud({
        center: DRIVER_VIEW_LAYOUT_INPUT.windscreenCenter,
        height: 1.04,
        horizontalAxis: [1, 0, 0],
        normalAxis: [0, 0.4289211977495297, 0.9033419098664186],
        thickness: 0.05,
        verticalAxis: [0, 0.9033419098664187, -0.42892119774952975],
        width: 1.48,
      }),
    });

    expect(plane.width).toBeCloseTo(1.48, 2);
    expect(plane.height).toBeCloseTo(1.04, 2);
    expect(plane.horizontalAxis[0]).toBeGreaterThan(0.9);
    expect(plane.verticalAxis[1]).toBeGreaterThan(0.8);
    expect(plane.verticalAxis[2]).toBeLessThan(-0.3);
    expect(plane.normalAxis[1]).toBeGreaterThan(0.3);
    expect(plane.normalAxis[2]).toBeGreaterThan(0.8);
  });

  it("keeps projected glyph points on the aligned windshield plane", () => {
    const plane = createTeslaDriverViewPlane({
      axisX: [1, 0, 0],
      axisY: [0, 0.6257776178808467, -0.7800015211263199],
      axisZ: [0, 0.78000152112632, 0.6257776178808468],
      center: DRIVER_VIEW_LAYOUT_INPUT.windscreenCenter,
      driverPosition: DRIVER_VIEW_LAYOUT_INPUT.steeringPosition,
      extents: [1.48, 1.04, 0.05],
    });
    const layout = createTeslaDriverViewLayout({
      ...DRIVER_VIEW_LAYOUT_INPUT,
      windscreenPlane: plane,
    });

    const point = projectTeslaDriverGlyphPosition(layout, 0.25, 0.35);
    const centerToPoint = subtract(point, layout.windscreenCenter);

    expect(dot(centerToPoint, layout.normalAxis)).toBeCloseTo(
      layout.glyphDepthOffset,
      5
    );
  });

  it("creates a glyph quaternion whose face aligns to the windshield plane", () => {
    const plane = createTeslaDriverViewPlane({
      axisX: [1, 0, 0],
      axisY: [0, 0.6257776178808467, -0.7800015211263199],
      axisZ: [0, 0.78000152112632, 0.6257776178808468],
      center: DRIVER_VIEW_LAYOUT_INPUT.windscreenCenter,
      driverPosition: DRIVER_VIEW_LAYOUT_INPUT.steeringPosition,
      extents: [1.48, 1.04, 0.05],
    });
    const layout = createTeslaDriverViewLayout({
      ...DRIVER_VIEW_LAYOUT_INPUT,
      windscreenPlane: plane,
    });
    const quaternion = createTeslaDriverGlyphQuaternion(layout, Math.PI * 0.25);
    const glyphNormal = new Vector3(0, 0, 1).applyQuaternion(quaternion);

    expect(glyphNormal.x).toBeCloseTo(layout.normalAxis[0], 5);
    expect(glyphNormal.y).toBeCloseTo(layout.normalAxis[1], 5);
    expect(glyphNormal.z).toBeCloseTo(layout.normalAxis[2], 5);
  });

  it("keeps camera framing anchored to the actual windshield center when the glyph field shifts", () => {
    const layout = createTeslaDriverViewLayout(DRIVER_VIEW_LAYOUT_INPUT, {
      ...DEFAULT_TESLA_DRIVER_VIEW_TUNING,
      lookAtOffsetX: 0,
      lookAtOffsetY: 0,
      lookAtOffsetZ: 0,
      windscreenCenterOffsetNormal: -0.024,
      windscreenCenterOffsetX: -0.22,
      windscreenCenterOffsetY: -0.12,
      windscreenHeightScale: 0.9,
      windscreenWidthScale: 0.9,
    });

    expect(layout.lookAt[0]).toBeCloseTo(DRIVER_VIEW_LAYOUT_INPUT.windscreenCenter[0], 2);
    expect(layout.lookAt[1]).toBeCloseTo(DRIVER_VIEW_LAYOUT_INPUT.windscreenCenter[1], 2);
    expect(layout.lookAt[2]).toBeCloseTo(DRIVER_VIEW_LAYOUT_INPUT.windscreenCenter[2], 2);
  });

  it("clamps driver view fov to the safe tuning range", () => {
    expect(TESLA_DRIVER_VIEW_FOV_RANGE.max).toBeGreaterThan(72);
    expect(clampTeslaDriverViewFov(TESLA_DRIVER_VIEW_FOV_RANGE.min - 8)).toBe(
      TESLA_DRIVER_VIEW_FOV_RANGE.min
    );
    expect(clampTeslaDriverViewFov(TESLA_DRIVER_VIEW_FOV_RANGE.max + 8)).toBe(
      TESLA_DRIVER_VIEW_FOV_RANGE.max
    );
  });

  it("keeps safe-area projected glyph centers inside the windshield bounds", () => {
    const layout = createTeslaDriverViewLayout(DRIVER_VIEW_LAYOUT_INPUT);
    const projectionInsets = createTeslaDriverGlyphProjectionInsets({
      glyphRadius: 25,
      pixelHeight: 500,
      pixelWidth: 1000,
    });

    const leftEdge = projectTeslaDriverGlyphPosition(layout, 0, 0.5, projectionInsets);
    const rightEdge = projectTeslaDriverGlyphPosition(layout, 1, 0.5, projectionInsets);
    const topEdge = projectTeslaDriverGlyphPosition(layout, 0.5, 0, projectionInsets);
    const bottomEdge = projectTeslaDriverGlyphPosition(layout, 0.5, 1, projectionInsets);

    expect(
      axisOffset(leftEdge, layout.windscreenCenter, layout.horizontalAxis)
    ).toBeGreaterThan(-layout.glyphVisibleWidth * 0.5);
    expect(
      axisOffset(rightEdge, layout.windscreenCenter, layout.horizontalAxis)
    ).toBeLessThan(layout.glyphVisibleWidth * 0.5);
    expect(
      axisOffset(topEdge, layout.windscreenCenter, layout.verticalAxis)
    ).toBeLessThan(layout.glyphVisibleHeight * layout.glyphYBias);
    expect(
      axisOffset(bottomEdge, layout.windscreenCenter, layout.verticalAxis)
    ).toBeGreaterThan(layout.glyphVisibleHeight * (layout.glyphYBias - 1));
  });
});
