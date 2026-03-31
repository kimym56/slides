"use client";

import { useFrame } from "@react-three/fiber";
import { useRef, type MutableRefObject } from "react";
import type * as THREE from "three";
import {
  WIPER_STAGE_COWL_COLOR,
  WIPER_STAGE_TRIM_COLOR,
  WIPER_STAGE_WIPER_ARM_COLOR,
  WIPER_STAGE_WIPER_BLADE_COLOR,
} from "./wiperConfig";

type WiperGroup = THREE.Group;

function getCockpitWiperRotation(phase: number, side: "left" | "right") {
  const clampedPhase = Math.max(0, Math.min(1, phase));

  return side === "left"
    ? -1.12 + clampedPhase * 1.24
    : 1.04 - clampedPhase * 1.14;
}

function WiperAssembly({
  armLength,
  bladeLength,
  direction,
  rotationZ,
  setRef,
}: {
  armLength: number;
  bladeLength: number;
  direction: 1 | -1;
  rotationZ: number;
  setRef: (node: WiperGroup | null) => void;
}) {
  const bladeThickness = Math.max(0.016, bladeLength * 0.04);
  const armThickness = bladeThickness * 0.42;

  return (
    <group ref={setRef} rotation={[0, 0, rotationZ]}>
      <mesh castShadow position={[0, 0, 0.015]} receiveShadow>
        <boxGeometry args={[bladeThickness * 1.7, bladeThickness * 1.7, bladeThickness * 1.2]} />
        <meshStandardMaterial color={WIPER_STAGE_TRIM_COLOR} metalness={0.18} roughness={0.62} />
      </mesh>
      <mesh
        castShadow
        position={[direction * bladeThickness * 0.26, armLength * 0.49, 0.016]}
        receiveShadow
      >
        <boxGeometry args={[armThickness, armLength, armThickness * 0.9]} />
        <meshStandardMaterial
          color={WIPER_STAGE_WIPER_ARM_COLOR}
          metalness={0.16}
          roughness={0.5}
        />
      </mesh>
      <mesh
        castShadow
        position={[direction * bladeLength * 0.18, armLength * 0.92, 0.02]}
        receiveShadow
      >
        <boxGeometry args={[bladeLength, bladeThickness, bladeThickness * 1.05]} />
        <meshStandardMaterial
          color={WIPER_STAGE_WIPER_BLADE_COLOR}
          metalness={0.08}
          roughness={0.34}
        />
      </mesh>
    </group>
  );
}

interface WiperTypographyCockpitWipers3DProps {
  phaseRef: MutableRefObject<number>;
  windshieldZ: number;
  worldHeight: number;
  worldWidth: number;
}

export default function WiperTypographyCockpitWipers3D({
  phaseRef,
  windshieldZ,
  worldHeight,
  worldWidth,
}: WiperTypographyCockpitWipers3DProps) {
  const leftWiperRef = useRef<WiperGroup | null>(null);
  const rightWiperRef = useRef<WiperGroup | null>(null);
  const leftMount: [number, number, number] = [
    -worldWidth * 0.24,
    -worldHeight * 0.43,
    windshieldZ + 0.08,
  ];
  const rightMount: [number, number, number] = [
    worldWidth * 0.23,
    -worldHeight * 0.44,
    windshieldZ + 0.08,
  ];
  const leftArmLength = worldHeight * 0.27;
  const rightArmLength = worldHeight * 0.255;
  const leftBladeLength = worldWidth * 0.46;
  const rightBladeLength = worldWidth * 0.41;

  useFrame(() => {
    if (leftWiperRef.current) {
      leftWiperRef.current.rotation.set(0, 0, getCockpitWiperRotation(phaseRef.current, "left"));
    }

    if (rightWiperRef.current) {
      rightWiperRef.current.rotation.set(0, 0, getCockpitWiperRotation(phaseRef.current, "right"));
    }
  });

  return (
    <group data-cockpit-role="wipers">
      <mesh position={[0, -worldHeight * 0.43, windshieldZ + 0.02]} receiveShadow>
        <boxGeometry args={[worldWidth * 1.02, worldHeight * 0.055, 0.12]} />
        <meshStandardMaterial color={WIPER_STAGE_COWL_COLOR} metalness={0.08} roughness={0.82} />
      </mesh>

      <mesh
        position={[0, -worldHeight * 0.39, windshieldZ + 0.05]}
        receiveShadow
        rotation={[-0.12, 0, 0]}
      >
        <boxGeometry args={[worldWidth * 0.94, worldHeight * 0.03, 0.06]} />
        <meshStandardMaterial color={WIPER_STAGE_TRIM_COLOR} metalness={0.12} roughness={0.68} />
      </mesh>

      <mesh position={[0, -worldHeight * 0.405, windshieldZ + 0.075]} receiveShadow>
        <boxGeometry args={[worldWidth * 0.78, worldHeight * 0.018, 0.04]} />
        <meshStandardMaterial color={WIPER_STAGE_TRIM_COLOR} metalness={0.1} roughness={0.64} />
      </mesh>

      <group position={leftMount}>
        <WiperAssembly
          armLength={leftArmLength}
          bladeLength={leftBladeLength}
          direction={1}
          rotationZ={getCockpitWiperRotation(0.5, "left")}
          setRef={(node) => {
            leftWiperRef.current = node;
          }}
        />
      </group>

      <group position={rightMount}>
        <WiperAssembly
          armLength={rightArmLength}
          bladeLength={rightBladeLength}
          direction={-1}
          rotationZ={getCockpitWiperRotation(0.5, "right")}
          setRef={(node) => {
            rightWiperRef.current = node;
          }}
        />
      </group>
    </group>
  );
}
