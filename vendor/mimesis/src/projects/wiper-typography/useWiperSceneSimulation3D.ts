"use client";

import { useThree } from "@react-three/fiber";
import { useMemo, useState } from "react";
import {
  createWiperSimulationState,
  detectWiperParticleCount,
  type WiperSimulationState,
} from "./wiperSimulation";

interface UseWiperSceneSimulation3DOptions {
  widthRatio: number;
  heightRatio: number;
  particleCount?: number;
}

export interface WiperSceneSimulation3DModel {
  simulation: WiperSimulationState;
  scale: number;
  worldWidth: number;
  worldHeight: number;
  pixelWidth: number;
  pixelHeight: number;
  glyphScale: number;
  projectX: (value: number) => number;
  projectY: (value: number) => number;
}

export function useWiperSceneSimulation3D({
  widthRatio,
  heightRatio,
  particleCount: particleCountOverride,
}: UseWiperSceneSimulation3DOptions): WiperSceneSimulation3DModel {
  const { viewport, size } = useThree();
  const [detectedParticleCount] = useState(detectWiperParticleCount);
  const particleCount = particleCountOverride ?? detectedParticleCount;
  const pixelWidth = Math.max(1, size.width);
  const pixelHeight = Math.max(1, size.height);
  const availableWidth = Math.max(1, viewport.width * widthRatio);
  const availableHeight = Math.max(1, viewport.height * heightRatio);
  const scale = Math.min(availableWidth / pixelWidth, availableHeight / pixelHeight);
  const simulation = useMemo<WiperSimulationState>(
    () =>
      createWiperSimulationState({
      width: pixelWidth,
      height: pixelHeight,
      particleCount,
      }),
    [particleCount, pixelHeight, pixelWidth]
  );

  return {
    simulation,
    scale,
    worldWidth: pixelWidth * scale,
    worldHeight: pixelHeight * scale,
    pixelWidth,
    pixelHeight,
    glyphScale: scale,
    projectX: (value) => (value - pixelWidth * 0.5) * scale,
    projectY: (value) => (pixelHeight * 0.5 - value) * scale,
  };
}
