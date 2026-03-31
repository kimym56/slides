export interface TeslaDriverViewTuning {
  cameraOffsetX: number;
  cameraOffsetY: number;
  cameraOffsetZ: number;
  fov: number;
  glyphDepthOffset: number;
  glyphHeightScale: number;
  glyphWidthScale: number;
  glyphYBias: number;
  lookAtOffsetX: number;
  lookAtOffsetY: number;
  lookAtOffsetZ: number;
  windscreenCenterOffsetNormal: number;
  windscreenCenterOffsetX: number;
  windscreenCenterOffsetY: number;
  windscreenHeightScale: number;
  windscreenWidthScale: number;
}

export const TESLA_DRIVER_VIEW_FOV_RANGE = {
  min: 8,
  max: 170,
} as const;

export function clampTeslaDriverViewFov(value: number) {
  return Math.min(
    TESLA_DRIVER_VIEW_FOV_RANGE.max,
    Math.max(TESLA_DRIVER_VIEW_FOV_RANGE.min, value),
  );
}

type TeslaDriverViewTuningKey = keyof TeslaDriverViewTuning;

interface TeslaDriverViewGuiControl {
  key: TeslaDriverViewTuningKey;
  label: string;
  max: number;
  min: number;
  step: number;
}

interface TeslaDriverViewGuiFolder {
  controls: TeslaDriverViewGuiControl[];
  title: string;
}

export const DEFAULT_TESLA_DRIVER_VIEW_TUNING: TeslaDriverViewTuning = {
  cameraOffsetX: 0.19,
  cameraOffsetY: 0.26,
  cameraOffsetZ: 0.57,
  fov: clampTeslaDriverViewFov(64),
  glyphDepthOffset: 0.07,
  glyphHeightScale: 1.19,
  glyphWidthScale: 1.37,
  glyphYBias: 0.43,
  lookAtOffsetX: 0.12,
  lookAtOffsetY: -0.0599,
  lookAtOffsetZ: 0.03,
  windscreenCenterOffsetNormal: 0,
  windscreenCenterOffsetX: -0.0599,
  windscreenCenterOffsetY: 0,
  windscreenHeightScale: 0.68,
  windscreenWidthScale: 0.72,
};

export const TESLA_DRIVER_VIEW_GUI_FOLDERS: TeslaDriverViewGuiFolder[] = [
  {
    title: "Camera",
    controls: [
      {
        key: "fov",
        label: "FOV",
        min: TESLA_DRIVER_VIEW_FOV_RANGE.min,
        max: TESLA_DRIVER_VIEW_FOV_RANGE.max,
        step: 1,
      },
      {
        key: "cameraOffsetX",
        label: "Offset X",
        min: -1.5,
        max: 1.5,
        step: 0.01,
      },
      {
        key: "cameraOffsetY",
        label: "Offset Y",
        min: -1.5,
        max: 1.5,
        step: 0.01,
      },
      {
        key: "cameraOffsetZ",
        label: "Offset Z",
        min: -1.5,
        max: 2.5,
        step: 0.01,
      },
      { key: "lookAtOffsetX", label: "Target X", min: -2, max: 2, step: 0.01 },
      { key: "lookAtOffsetY", label: "Target Y", min: -2, max: 2, step: 0.01 },
      { key: "lookAtOffsetZ", label: "Target Z", min: -2, max: 2, step: 0.01 },
    ],
  },
  {
    title: "Windshield",
    controls: [
      {
        key: "windscreenWidthScale",
        label: "Width",
        min: 0.05,
        max: 3,
        step: 0.01,
      },
      {
        key: "windscreenHeightScale",
        label: "Height",
        min: 0.05,
        max: 3,
        step: 0.01,
      },
      {
        key: "windscreenCenterOffsetX",
        label: "Center X",
        min: -2,
        max: 2,
        step: 0.01,
      },
      {
        key: "windscreenCenterOffsetY",
        label: "Center Y",
        min: -2,
        max: 2,
        step: 0.01,
      },
      {
        key: "windscreenCenterOffsetNormal",
        label: "Center Z",
        min: -1.5,
        max: 1.5,
        step: 0.002,
      },
    ],
  },
  {
    title: "Glyphs",
    controls: [
      {
        key: "glyphWidthScale",
        label: "Width",
        min: 0.05,
        max: 3,
        step: 0.01,
      },
      {
        key: "glyphHeightScale",
        label: "Height",
        min: 0.05,
        max: 3,
        step: 0.01,
      },
      {
        key: "glyphYBias",
        label: "Y Bias",
        min: -2,
        max: 3,
        step: 0.01,
      },
      {
        key: "glyphDepthOffset",
        label: "Depth",
        min: -1,
        max: 1,
        step: 0.002,
      },
    ],
  },
];
