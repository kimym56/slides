"use client";

import { useEffect, useRef } from "react";
import type { InteractiveProjectProps } from "../types";
import { WIPER_BACKGROUND_COLOR } from "./wiperConfig";
import { drawWiperScene } from "./wiperSceneRenderer";
import {
  createWiperSimulationState,
  detectWiperParticleCount,
  stepWiperSimulationState,
  type WiperSimulationState,
} from "./wiperSimulation";
import styles from "./WiperTypographyProject.module.css";
import { useWiperInteraction } from "./useWiperInteraction";

export default function WiperTypographyCanvas2D({
  projectId,
}: InteractiveProjectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { containerRef, dragLayerRef, dragLayerProps, phaseRef, sizeRef, tick } =
    useWiperInteraction({ interactionMode: "legacy-phase", margin: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let frame = 0;
    let width = 1;
    let height = 1;
    let dpr = 1;
    let scene: WiperSimulationState | null = null;

    const buildScene = () => {
      width = Math.max(1, sizeRef.current.width);
      height = Math.max(1, sizeRef.current.height);
      dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);

      scene = createWiperSimulationState({
        width,
        height,
        particleCount: detectWiperParticleCount(),
        phase: phaseRef.current,
      });
    };

    const ensureStage = () => {
      const { width: nextWidth, height: nextHeight } = sizeRef.current;
      const nextDpr = window.devicePixelRatio || 1;
      if (nextWidth !== width || nextHeight !== height || nextDpr !== dpr) {
        buildScene();
      }
    };

    const tickFrame = () => {
      ensureStage();

      const phase = tick();
      if (scene === null) {
        buildScene();
      }

      if (scene === null) {
        frame = window.requestAnimationFrame(tickFrame);
        return;
      }

      stepWiperSimulationState(scene, phase);

      drawWiperScene(context, scene, { backgroundColor: WIPER_BACKGROUND_COLOR });

      frame = window.requestAnimationFrame(tickFrame);
    };

    buildScene();
    frame = window.requestAnimationFrame(tickFrame);

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [containerRef, phaseRef, sizeRef, tick]);

  return (
    <div
      className={styles.wrapper}
      data-project-id={projectId}
      ref={containerRef}
      role="img"
      aria-label="Interactive wiper typography simulation"
    >
      <canvas className={styles.canvas} ref={canvasRef} />
      <div className={styles.dragLayer} ref={dragLayerRef} {...dragLayerProps} />
    </div>
  );
}
