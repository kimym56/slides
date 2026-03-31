"use client";

import { useGLTF } from "@react-three/drei";
import { useEffect } from "react";
import type { Object3D } from "three";

export const TESLA_DRIVER_VIEW_MODEL_PATH = "/models/tesla_2018_model_3.glb";
export const TESLA_DRIVER_VIEW_MODEL_SCALE = 0.01;

function applyShadows(node: Object3D) {
  node.traverse((child) => {
    const mesh = child as Object3D & {
      castShadow?: boolean;
      receiveShadow?: boolean;
    };

    mesh.castShadow = true;
    mesh.receiveShadow = true;
  });
}

export default function WiperTypographyTeslaModel({
  onReady,
}: {
  onReady?: (scene: Object3D) => void;
}) {
  const gltf = useGLTF(TESLA_DRIVER_VIEW_MODEL_PATH);

  useEffect(() => {
    applyShadows(gltf.scene);
    gltf.scene.updateMatrixWorld(true);
    onReady?.(gltf.scene);
  }, [gltf.scene, onReady]);

  return (
    <primitive
      object={gltf.scene}
      position={[0, 0, 0]}
      scale={TESLA_DRIVER_VIEW_MODEL_SCALE}
    />
  );
}

useGLTF.preload(TESLA_DRIVER_VIEW_MODEL_PATH);
