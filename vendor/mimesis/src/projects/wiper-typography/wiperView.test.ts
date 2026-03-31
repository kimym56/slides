import { describe, expect, it } from "vitest";
import { WIPER_MAX_VIEW_PITCH, WIPER_MAX_VIEW_YAW } from "./wiperConfig";
import {
  applyDriverViewCameraOffset,
  computeWiperCameraPose,
  mapWheelDeltaToDriverViewFov,
  mapDragDeltaToViewAngle,
  stepViewAngleToward,
} from "./wiperView";
import { DEFAULT_TESLA_DRIVER_VIEW_TUNING, TESLA_DRIVER_VIEW_FOV_RANGE } from "./wiperTeslaDriverTuning";

describe("wiperView", () => {
  it("maps desktop drag delta into clamped yaw and pitch", () => {
    const view = mapDragDeltaToViewAngle(
      { yaw: 0.1, pitch: -0.05 },
      { deltaX: 600, deltaY: -400, width: 1200, height: 800 }
    );

    expect(view.yaw).toBeLessThanOrEqual(WIPER_MAX_VIEW_YAW);
    expect(view.pitch).toBeGreaterThanOrEqual(-WIPER_MAX_VIEW_PITCH);
  });

  it("builds a restrained camera pose from view angle and stage bias", () => {
    const pose = computeWiperCameraPose({
      view: { yaw: 0.2, pitch: -0.1 },
      phaseBias: { x: 0.08, y: 0.02 },
      distance: 6,
    });

    expect(pose.position[2]).toBe(6);
    expect(Math.abs(pose.lookAt[0])).toBeGreaterThan(0);
  });

  it("keeps stage phase bias and drag angle in one shared camera pose", () => {
    const pose = computeWiperCameraPose({
      view: { yaw: 0.18, pitch: -0.08 },
      phaseBias: { x: 0.06, y: 0.01 },
      distance: 6,
    });

    expect(pose.position[0]).toBeGreaterThan(0);
    expect(pose.position[1]).toBeGreaterThan(0);
  });

  it("maps wheel delta into a clamped driver-view fov", () => {
    const zoomedIn = mapWheelDeltaToDriverViewFov(
      DEFAULT_TESLA_DRIVER_VIEW_TUNING.fov,
      -240
    );
    const zoomedOut = mapWheelDeltaToDriverViewFov(
      DEFAULT_TESLA_DRIVER_VIEW_TUNING.fov,
      20000
    );

    expect(zoomedIn).toBeLessThan(DEFAULT_TESLA_DRIVER_VIEW_TUNING.fov);
    expect(zoomedOut).toBe(TESLA_DRIVER_VIEW_FOV_RANGE.max);
  });

  it("applies driver-view yaw and pitch offsets around the tuned layout camera", () => {
    const pose = applyDriverViewCameraOffset(
      {
        cameraPosition: [0, 0, 0.5],
        lookAt: [0, 0, -1],
        horizontalAxis: [1, 0, 0],
        verticalAxis: [0, 1, 0],
      },
      { yaw: 0.2, pitch: 0.1 }
    );

    expect(pose.position[0]).toBeGreaterThan(0);
    expect(pose.lookAt[0]).toBeGreaterThan(0);
    expect(pose.lookAt[1]).toBeGreaterThan(0);
  });

  it("eases the displayed view toward the latest drag target", () => {
    const next = stepViewAngleToward(
      { yaw: 0, pitch: 0 },
      { yaw: 0.4, pitch: -0.2 },
      0.2
    );

    expect(next.yaw).toBeGreaterThan(0);
    expect(next.yaw).toBeLessThan(0.4);
    expect(next.pitch).toBeLessThan(0);
    expect(next.pitch).toBeGreaterThan(-0.2);
  });
});
