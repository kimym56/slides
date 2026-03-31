export type WiperDriverViewPerformancePreset = "default" | "slides";

export interface WiperDriverViewPerformanceSettings {
  canvasDpr: number | [number, number];
  overlayTextureMaxSize: number;
  overlayTextureScale: number;
  particleCount: number | undefined;
}

export function resolveWiperDriverViewPerformanceSettings(
  preset: WiperDriverViewPerformancePreset = "default",
): WiperDriverViewPerformanceSettings {
  if (preset === "slides") {
    return {
      canvasDpr: 1,
      overlayTextureMaxSize: 1024,
      overlayTextureScale: 1,
      particleCount: 48,
    };
  }

  return {
    canvasDpr: [1, 2],
    overlayTextureMaxSize: 2048,
    overlayTextureScale: 2,
    particleCount: undefined,
  };
}
