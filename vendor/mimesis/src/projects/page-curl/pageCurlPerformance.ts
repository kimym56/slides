export type PageCurlPerformancePreset = "default" | "slides";

export interface PageCurlPerformanceSettings {
  canvasDpr: number | [number, number] | undefined;
  meshSegments: number;
  shadowMapSize: number;
}

export function resolvePageCurlPerformanceSettings(
  preset: PageCurlPerformancePreset = "default",
): PageCurlPerformanceSettings {
  if (preset === "slides") {
    return {
      canvasDpr: 1,
      meshSegments: 128,
      shadowMapSize: 1024,
    };
  }

  return {
    canvasDpr: undefined,
    meshSegments: 512,
    shadowMapSize: 4096,
  };
}
