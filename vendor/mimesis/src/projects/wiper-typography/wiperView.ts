import {
  WIPER_MAX_VIEW_PITCH,
  WIPER_MAX_VIEW_YAW,
  WIPER_VIEW_PITCH_SENSITIVITY,
  WIPER_VIEW_YAW_SENSITIVITY,
} from "./wiperConfig";
import { clamp } from "./wiperMath";
import { clampTeslaDriverViewFov } from "./wiperTeslaDriverTuning";

export interface WiperViewAngle {
  yaw: number;
  pitch: number;
}

interface DriverViewCameraLayout {
  cameraPosition: [number, number, number];
  lookAt: [number, number, number];
  horizontalAxis: [number, number, number];
  verticalAxis: [number, number, number];
}

interface WiperCameraPoseInput {
  view: WiperViewAngle;
  phaseBias?: { x: number; y: number };
  distance: number;
}

const DRIVER_VIEW_FOV_WHEEL_SENSITIVITY = 0.02;

function addScaledVector3(
  [x, y, z]: [number, number, number],
  [ax, ay, az]: [number, number, number],
  scalar: number
): [number, number, number] {
  return [x + ax * scalar, y + ay * scalar, z + az * scalar];
}

function distanceBetween(
  [ax, ay, az]: [number, number, number],
  [bx, by, bz]: [number, number, number]
) {
  return Math.hypot(ax - bx, ay - by, az - bz);
}

export function mapDragDeltaToViewAngle(
  origin: WiperViewAngle,
  input: { deltaX: number; deltaY: number; width: number; height: number }
): WiperViewAngle {
  const nextYaw =
    origin.yaw +
    (input.deltaX / Math.max(1, input.width)) * WIPER_VIEW_YAW_SENSITIVITY;
  const nextPitch =
    origin.pitch -
    (input.deltaY / Math.max(1, input.height)) * WIPER_VIEW_PITCH_SENSITIVITY;

  return {
    yaw: clamp(nextYaw, -WIPER_MAX_VIEW_YAW, WIPER_MAX_VIEW_YAW),
    pitch: clamp(nextPitch, -WIPER_MAX_VIEW_PITCH, WIPER_MAX_VIEW_PITCH),
  };
}

export function stepViewAngleToward(
  current: WiperViewAngle,
  target: WiperViewAngle,
  factor: number
): WiperViewAngle {
  const clampedFactor = clamp(factor, 0, 1);

  return {
    yaw: current.yaw + (target.yaw - current.yaw) * clampedFactor,
    pitch: current.pitch + (target.pitch - current.pitch) * clampedFactor,
  };
}

export function mapWheelDeltaToDriverViewFov(currentFov: number, deltaY: number) {
  return clampTeslaDriverViewFov(
    currentFov + deltaY * DRIVER_VIEW_FOV_WHEEL_SENSITIVITY
  );
}

export function applyDriverViewCameraOffset(
  layout: DriverViewCameraLayout,
  view: WiperViewAngle
) {
  const distance = distanceBetween(layout.cameraPosition, layout.lookAt);
  const position = addScaledVector3(
    addScaledVector3(
      layout.cameraPosition,
      layout.horizontalAxis,
      view.yaw * distance * 0.16
    ),
    layout.verticalAxis,
    -view.pitch * distance * 0.08
  );
  const lookAt = addScaledVector3(
    addScaledVector3(
      layout.lookAt,
      layout.horizontalAxis,
      view.yaw * distance * 0.5
    ),
    layout.verticalAxis,
    view.pitch * distance * 0.38
  );

  return {
    position,
    lookAt,
  };
}

export function computeWiperCameraPose({
  view,
  phaseBias = { x: 0, y: 0 },
  distance,
}: WiperCameraPoseInput) {
  return {
    position: [
      phaseBias.x + view.yaw * distance * 0.55,
      phaseBias.y - view.pitch * distance * 0.4,
      distance,
    ] as const,
    lookAt: [
      phaseBias.x + view.yaw * 0.45,
      phaseBias.y + view.pitch * 0.12,
      0,
    ] as const,
  };
}
