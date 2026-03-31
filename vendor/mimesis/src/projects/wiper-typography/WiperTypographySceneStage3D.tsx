"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import type * as THREE from "three";
import type { InteractiveProjectProps } from "../types";
import WiperTypographyCockpitShell3D from "./WiperTypographyCockpitShell3D";
import WiperTypographyCockpitWipers3D from "./WiperTypographyCockpitWipers3D";
import WiperTypographyExtrudedGlyph3D from "./WiperTypographyExtrudedGlyph3D";
import WiperTypographySceneFrame from "./WiperTypographySceneFrame";
import { getWiperGlyphGeometry } from "./wiperGlyphGeometry";
import {
  WIPER_STAGE_GLYPH_DEPTH_OFFSET,
  WIPER_STAGE_GLYPH_DEPTH_SPREAD,
  WIPER_STAGE_GLYPH_SCALE_MULTIPLIER,
} from "./wiperConfig";
import {
  computeGlyphLayerDepth,
  computeStageCameraOffset,
} from "./wiperMath";
import {
  stepWiperSimulationState,
  type WiperGlyphState,
} from "./wiperSimulation";
import { useWiperSceneSimulation3D } from "./useWiperSceneSimulation3D";

type GlyphMesh = THREE.Mesh;

const STAGE_GLYPH_LAYER_COUNT = 3;

function getStageGlyphDepth(layerIndex: number) {
  return (
    computeGlyphLayerDepth(layerIndex, STAGE_GLYPH_LAYER_COUNT) *
      WIPER_STAGE_GLYPH_DEPTH_SPREAD +
    WIPER_STAGE_GLYPH_DEPTH_OFFSET
  );
}

function StageScene({
  phaseRef,
}: {
  phaseRef: MutableRefObject<number>;
}) {
  const glyphRefs = useRef<Array<GlyphMesh | null>>([]);
  const { glyphScale, projectX, projectY, simulation, worldHeight, worldWidth } =
    useWiperSceneSimulation3D({
      widthRatio: 0.82,
      heightRatio: 0.8,
    });
  const stageGlyphScale = glyphScale * WIPER_STAGE_GLYPH_SCALE_MULTIPLIER;
  const windshieldY = worldHeight * 0.02;
  const windshieldZ = 0.08;

  useFrame(() => {
    stepWiperSimulationState(simulation, phaseRef.current);

    for (const glyph of simulation.glyphs) {
      const mesh = glyphRefs.current[glyph.index];
      if (!mesh) {
        continue;
      }

      const layerIndex = glyph.index % STAGE_GLYPH_LAYER_COUNT;
      const depth = getStageGlyphDepth(layerIndex);
      const nextGeometry = getWiperGlyphGeometry(glyph.text);

      if (mesh.geometry !== nextGeometry) {
        mesh.geometry = nextGeometry;
      }

      mesh.position.set(projectX(glyph.x), projectY(glyph.y), depth);
      mesh.rotation.set(0, 0, -glyph.rotation * Math.PI);
      mesh.scale.set(stageGlyphScale, stageGlyphScale, stageGlyphScale);
    }
  });

  return (
    <>
      <WiperTypographyCockpitShell3D
        windshieldY={windshieldY}
        windshieldZ={windshieldZ}
        worldHeight={worldHeight}
        worldWidth={worldWidth}
      />

      {simulation.glyphs.map((glyph: WiperGlyphState) => {
        const layerIndex = glyph.index % STAGE_GLYPH_LAYER_COUNT;
        const depth = getStageGlyphDepth(layerIndex);

        return (
          <WiperTypographyExtrudedGlyph3D
            glyph={glyph.text}
            key={glyph.index}
            position={[projectX(glyph.x), projectY(glyph.y), depth]}
            ref={(node) => {
              glyphRefs.current[glyph.index] = node;
            }}
            rotationZ={-glyph.rotation * Math.PI}
            scale={stageGlyphScale}
          />
        );
      })}

      <WiperTypographyCockpitWipers3D
        phaseRef={phaseRef}
        windshieldZ={windshieldZ}
        worldHeight={worldHeight}
        worldWidth={worldWidth}
      />
    </>
  );
}

export default function WiperTypographySceneStage3D({
  projectId,
}: InteractiveProjectProps) {
  return (
    <WiperTypographySceneFrame
      cameraBias={(phase) => {
        const offset = computeStageCameraOffset(phase);
        return {
          x: offset.x * 0.22,
          y: offset.y * 0.18 - 0.09,
        };
      }}
      projectId={projectId}
      renderScene={({ phaseRef }) => <StageScene phaseRef={phaseRef} />}
    />
  );
}
