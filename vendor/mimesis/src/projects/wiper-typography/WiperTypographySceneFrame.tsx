"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, type MutableRefObject, type ReactNode } from "react";
import { computeWiperCameraPose } from "./wiperView";
import type { InteractiveProjectProps } from "../types";
import { WIPER_BACKGROUND_COLOR } from "./wiperConfig";
import styles from "./WiperTypographyProject.module.css";
import { useWiperInteraction } from "./useWiperInteraction";

interface WiperSceneFrameModel {
  phaseRef: MutableRefObject<number>;
  sizeRef: MutableRefObject<{ width: number; height: number }>;
}

function CameraRig({
  tick,
  viewRef,
  cameraBias,
}: {
  tick: () => number;
  viewRef: MutableRefObject<{ yaw: number; pitch: number }>;
  cameraBias?: (phase: number) => { x: number; y: number };
}) {
  useFrame((state) => {
    const phase = tick();
    const pose = computeWiperCameraPose({
      view: {
        yaw: viewRef.current.yaw,
        pitch: viewRef.current.pitch,
      },
      phaseBias: cameraBias?.(phase) ?? { x: 0, y: 0 },
      distance: state.camera.position.z,
    });

    state.camera.position.set(...pose.position);
    state.camera.lookAt(...pose.lookAt);
  });

  return null;
}

export default function WiperTypographySceneFrame({
  cameraBias,
  projectId,
  renderScene,
}: InteractiveProjectProps & {
  cameraBias?: (phase: number) => { x: number; y: number };
  renderScene: (model: WiperSceneFrameModel) => ReactNode;
}) {
  const {
    containerRef,
    dragLayerRef,
    dragLayerProps,
    phaseRef,
    sizeRef,
    tick,
    viewRef,
  } = useWiperInteraction({ interactionMode: "desktop-view-drag", margin: 0 });

  return (
    <div
      className={styles.wrapper}
      data-project-id={projectId}
      ref={containerRef}
      role="img"
      aria-label="Interactive wiper typography simulation"
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 40 }}
        dpr={[1, 2]}
        shadows
        style={{ inset: 0, position: "absolute" }}
      >
        <color attach="background" args={[WIPER_BACKGROUND_COLOR]} />
        <ambientLight intensity={0.55} />
        <directionalLight castShadow intensity={1.05} position={[5, 6, 8]} />
        <CameraRig
          cameraBias={cameraBias}
          tick={tick}
          viewRef={viewRef}
        />
        <Suspense fallback={null}>
          {renderScene({ phaseRef, sizeRef })}
        </Suspense>
      </Canvas>
      <div className={styles.dragLayer} ref={dragLayerRef} {...dragLayerProps} />
    </div>
  );
}
