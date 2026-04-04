"use client";

import { forwardRef } from "react";
import { MeshStandardMaterial } from "three/src/materials/MeshStandardMaterial.js";
import type * as THREE from "three";
import {
  WIPER_3D_GLYPH_SIDE_COLOR,
  WIPER_GLYPH_COLOR,
} from "./wiperConfig";
import { getWiperGlyphGeometry } from "./wiperGlyphGeometry";

interface WiperTypographyExtrudedGlyph3DProps {
  glyph: string;
  position: [number, number, number];
  rotationZ: number;
  scale: number;
}

const glyphMaterials = [
  new MeshStandardMaterial({
    color: WIPER_GLYPH_COLOR,
    metalness: 0.02,
    roughness: 0.76,
  }),
  new MeshStandardMaterial({
    color: WIPER_3D_GLYPH_SIDE_COLOR,
    metalness: 0.02,
    roughness: 0.82,
  }),
];

const WiperTypographyExtrudedGlyph3D = forwardRef<
  THREE.Mesh,
  WiperTypographyExtrudedGlyph3DProps
>(function WiperTypographyExtrudedGlyph3D(
  {
    glyph,
    position,
    rotationZ,
    scale,
  },
  ref
) {
  return (
    <mesh
      castShadow
      geometry={getWiperGlyphGeometry(glyph)}
      material={glyphMaterials}
      position={position}
      receiveShadow
      ref={ref}
      rotation={[0, 0, rotationZ]}
      scale={[scale, scale, scale]}
    />
  );
});

export default WiperTypographyExtrudedGlyph3D;
