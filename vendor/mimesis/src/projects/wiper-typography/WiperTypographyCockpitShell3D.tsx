"use client";

import {
  WIPER_STAGE_DASHBOARD_COLOR,
  WIPER_STAGE_DISPLAY_MOUNT_COLOR,
  WIPER_STAGE_EXTERIOR_COLOR,
  WIPER_STAGE_GLASS_COLOR,
  WIPER_STAGE_GLASS_OPACITY,
  WIPER_STAGE_HEADLINER_COLOR,
  WIPER_STAGE_SIMULATOR_GROUND_COLOR,
  WIPER_STAGE_SIMULATOR_GRID_COLOR,
  WIPER_STAGE_SCREEN_FRAME_COLOR,
  WIPER_STAGE_SCREEN_GLOW_COLOR,
  WIPER_STAGE_SCREEN_SURFACE_COLOR,
  WIPER_STAGE_TRIM_COLOR,
  WIPER_STAGE_WINDSHIELD_FRAME_COLOR,
  WIPER_STAGE_YOKE_COLOR,
} from "./wiperConfig";

interface WiperTypographyCockpitShell3DProps {
  worldHeight: number;
  worldWidth: number;
  windshieldY: number;
  windshieldZ: number;
}

export default function WiperTypographyCockpitShell3D({
  worldHeight,
  worldWidth,
  windshieldY,
  windshieldZ,
}: WiperTypographyCockpitShell3DProps) {
  const simulatorGuideOffsets = [-0.32, -0.12, 0.12, 0.32];
  const simulatorCrossOffsets = [0, 0.26, 0.52];
  const dashWingY = -worldHeight * 0.31;
  const dashWingZ = 0.24;
  const displayX = worldWidth * 0.08;
  const screenWidth = worldWidth * 0.29;
  const screenHeight = worldHeight * 0.18;
  const screenZ = dashWingZ + 0.18;
  const pillarWidth = worldWidth * 0.088;
  const pillarHeight = worldHeight * 1.22;
  const pillarOffsetX = worldWidth * 0.54;
  const yokeY = -worldHeight * 0.5;
  const yokeZ = 0.52;
  const yokeWidth = worldWidth * 0.31;
  const yokeGripHeight = worldHeight * 0.118;
  const windshieldRotationX = -0.12;

  return (
    <>
      <group
        data-cockpit-role="simulator-field"
        position={[0, windshieldY - worldHeight * 0.02, -0.9]}
      >
        <mesh position={[0, worldHeight * 0.21, -0.02]} receiveShadow>
          <planeGeometry args={[worldWidth * 1.28, worldHeight * 0.92]} />
          <meshStandardMaterial
            color={WIPER_STAGE_EXTERIOR_COLOR}
            metalness={0.02}
            roughness={0.95}
          />
        </mesh>

        <mesh
          position={[0, -worldHeight * 0.34, 0.24]}
          receiveShadow
          rotation={[-1.16, 0, 0]}
        >
          <planeGeometry args={[worldWidth * 1.24, worldHeight * 0.92]} />
          <meshStandardMaterial
            color={WIPER_STAGE_SIMULATOR_GROUND_COLOR}
            metalness={0.02}
            roughness={0.94}
          />
        </mesh>

        {simulatorGuideOffsets.map((offset) => (
          <mesh
            key={`guide-${offset}`}
            position={[worldWidth * offset, -worldHeight * 0.34, 0.25]}
            rotation={[-1.16, 0, 0]}
          >
            <planeGeometry args={[worldWidth * 0.0035, worldHeight * 0.78]} />
            <meshBasicMaterial
              color={WIPER_STAGE_SIMULATOR_GRID_COLOR}
              opacity={0.65}
              transparent
            />
          </mesh>
        ))}

        {simulatorCrossOffsets.map((offset) => (
          <mesh
            key={`cross-${offset}`}
            position={[0, -worldHeight * (0.28 + offset * 0.22), 0.2 - offset * 0.09]}
            rotation={[-1.16, 0, 0]}
          >
            <planeGeometry args={[worldWidth * 0.95, worldHeight * 0.0032]} />
            <meshBasicMaterial
              color={WIPER_STAGE_SIMULATOR_GRID_COLOR}
              opacity={0.48}
              transparent
            />
          </mesh>
        ))}
      </group>

      <mesh castShadow position={[0, dashWingY, dashWingZ]} receiveShadow>
        <boxGeometry args={[worldWidth * 1.24, worldHeight * 0.052, 0.24]} />
        <meshStandardMaterial
          color={WIPER_STAGE_DASHBOARD_COLOR}
          metalness={0.08}
          roughness={0.82}
        />
      </mesh>

      <mesh
        castShadow
        position={[0, dashWingY + worldHeight * 0.03, dashWingZ + 0.08]}
        receiveShadow
      >
        <boxGeometry args={[worldWidth * 0.52, worldHeight * 0.02, 0.16]} />
        <meshStandardMaterial color={WIPER_STAGE_TRIM_COLOR} metalness={0.14} roughness={0.62} />
      </mesh>

      <mesh
        castShadow
        position={[-worldWidth * 0.43, dashWingY + worldHeight * 0.01, dashWingZ + 0.08]}
        receiveShadow
        rotation={[0, 0.22, 0]}
      >
        <boxGeometry args={[worldWidth * 0.2, worldHeight * 0.072, 0.16]} />
        <meshStandardMaterial color={WIPER_STAGE_TRIM_COLOR} metalness={0.12} roughness={0.7} />
      </mesh>

      <mesh
        castShadow
        position={[worldWidth * 0.43, dashWingY + worldHeight * 0.01, dashWingZ + 0.08]}
        receiveShadow
        rotation={[0, -0.22, 0]}
      >
        <boxGeometry args={[worldWidth * 0.2, worldHeight * 0.072, 0.16]} />
        <meshStandardMaterial color={WIPER_STAGE_TRIM_COLOR} metalness={0.12} roughness={0.7} />
      </mesh>

      <group
        data-cockpit-role="center-display"
        position={[displayX, dashWingY + worldHeight * 0.084, screenZ]}
        rotation={[-0.06, -0.02, 0]}
      >
        <mesh castShadow position={[0, -worldHeight * 0.065, -0.055]} receiveShadow>
          <boxGeometry args={[worldWidth * 0.07, worldHeight * 0.12, 0.04]} />
          <meshStandardMaterial
            color={WIPER_STAGE_DISPLAY_MOUNT_COLOR}
            metalness={0.14}
            roughness={0.58}
          />
        </mesh>

        <mesh castShadow receiveShadow>
          <boxGeometry args={[screenWidth, screenHeight, 0.045]} />
          <meshStandardMaterial
            color={WIPER_STAGE_SCREEN_FRAME_COLOR}
            metalness={0.18}
            roughness={0.48}
          />
        </mesh>
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[screenWidth * 0.9, screenHeight * 0.82]} />
          <meshStandardMaterial
            color={WIPER_STAGE_SCREEN_SURFACE_COLOR}
            emissive={WIPER_STAGE_SCREEN_GLOW_COLOR}
            emissiveIntensity={0.16}
            metalness={0.04}
            roughness={0.18}
          />
        </mesh>
      </group>

      <mesh
        position={[displayX, dashWingY + worldHeight * 0.086, screenZ - 0.03]}
        rotation={[-0.08, -0.02, 0]}
      >
        <planeGeometry args={[screenWidth * 1.04, screenHeight * 0.96]} />
        <meshBasicMaterial
          color={WIPER_STAGE_SCREEN_GLOW_COLOR}
          opacity={0.045}
          transparent
        />
      </mesh>

      <mesh
        position={[-pillarOffsetX, windshieldY + worldHeight * 0.02, 0.09]}
        receiveShadow
        rotation={[0, 0, 0.18]}
      >
        <boxGeometry args={[pillarWidth, pillarHeight, 0.24]} />
        <meshStandardMaterial
          color={WIPER_STAGE_WINDSHIELD_FRAME_COLOR}
          metalness={0.14}
          roughness={0.76}
        />
      </mesh>

      <mesh
        position={[pillarOffsetX, windshieldY + worldHeight * 0.02, 0.09]}
        receiveShadow
        rotation={[0, 0, -0.18]}
      >
        <boxGeometry args={[pillarWidth, pillarHeight, 0.24]} />
        <meshStandardMaterial
          color={WIPER_STAGE_WINDSHIELD_FRAME_COLOR}
          metalness={0.14}
          roughness={0.76}
        />
      </mesh>

      <mesh
        position={[-pillarOffsetX * 0.94, windshieldY + worldHeight * 0.06, windshieldZ - 0.02]}
        receiveShadow
        rotation={[0, 0.08, 0.12]}
      >
        <boxGeometry args={[worldWidth * 0.03, worldHeight * 1.04, 0.1]} />
        <meshStandardMaterial color={WIPER_STAGE_TRIM_COLOR} metalness={0.1} roughness={0.74} />
      </mesh>

      <mesh
        position={[pillarOffsetX * 0.94, windshieldY + worldHeight * 0.06, windshieldZ - 0.02]}
        receiveShadow
        rotation={[0, -0.08, -0.12]}
      >
        <boxGeometry args={[worldWidth * 0.03, worldHeight * 1.04, 0.1]} />
        <meshStandardMaterial color={WIPER_STAGE_TRIM_COLOR} metalness={0.1} roughness={0.74} />
      </mesh>

      <mesh position={[0, worldHeight * 0.56, 0.12]} receiveShadow>
        <boxGeometry args={[worldWidth * 1.1, worldHeight * 0.085, 0.22]} />
        <meshStandardMaterial
          color={WIPER_STAGE_HEADLINER_COLOR}
          metalness={0.1}
          roughness={0.84}
        />
      </mesh>

      <mesh position={[0, windshieldY + worldHeight * 0.54, 0.08]} receiveShadow>
        <boxGeometry args={[worldWidth * 1.04, worldHeight * 0.03, 0.16]} />
        <meshStandardMaterial
          color={WIPER_STAGE_WINDSHIELD_FRAME_COLOR}
          metalness={0.08}
          roughness={0.78}
        />
      </mesh>

      <mesh position={[0, windshieldY - worldHeight * 0.13, windshieldZ - 0.02]} receiveShadow>
        <boxGeometry args={[worldWidth * 1.02, worldHeight * 0.028, 0.08]} />
        <meshStandardMaterial
          color={WIPER_STAGE_WINDSHIELD_FRAME_COLOR}
          metalness={0.08}
          roughness={0.78}
        />
      </mesh>

      <mesh position={[0, windshieldY, windshieldZ]} rotation={[windshieldRotationX, 0, 0]}>
        <planeGeometry args={[worldWidth * 1.15, worldHeight * 1.1]} />
        <meshPhysicalMaterial
          color={WIPER_STAGE_GLASS_COLOR}
          opacity={WIPER_STAGE_GLASS_OPACITY}
          roughness={0.16}
          transparent
          transmission={0.06}
        />
      </mesh>

      <mesh
        position={[0, windshieldY + worldHeight * 0.08, windshieldZ + 0.01]}
        rotation={[windshieldRotationX, 0, 0]}
      >
        <planeGeometry args={[worldWidth * 0.9, worldHeight * 0.3]} />
        <meshBasicMaterial
          color={WIPER_STAGE_GLASS_COLOR}
          opacity={0.035}
          transparent
        />
      </mesh>

      <group data-cockpit-role="yoke" position={[0, yokeY, yokeZ]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[worldWidth * 0.1, worldHeight * 0.045, 0.09]} />
          <meshStandardMaterial color={WIPER_STAGE_YOKE_COLOR} metalness={0.16} roughness={0.54} />
        </mesh>
        <mesh
          castShadow
          position={[0, worldHeight * 0.045, 0]}
          receiveShadow
          rotation={[0, 0, Math.PI * 0.5]}
        >
          <cylinderGeometry args={[0.016, 0.016, yokeWidth * 0.72, 18]} />
          <meshStandardMaterial color={WIPER_STAGE_YOKE_COLOR} metalness={0.16} roughness={0.54} />
        </mesh>
        <mesh
          castShadow
          position={[-yokeWidth * 0.16, -worldHeight * 0.01, 0]}
          receiveShadow
          rotation={[0, 0, -0.72]}
        >
          <cylinderGeometry args={[0.018, 0.018, yokeGripHeight, 18]} />
          <meshStandardMaterial color={WIPER_STAGE_YOKE_COLOR} metalness={0.16} roughness={0.54} />
        </mesh>
        <mesh
          castShadow
          position={[yokeWidth * 0.16, -worldHeight * 0.01, 0]}
          receiveShadow
          rotation={[0, 0, 0.72]}
        >
          <cylinderGeometry args={[0.018, 0.018, yokeGripHeight, 18]} />
          <meshStandardMaterial color={WIPER_STAGE_YOKE_COLOR} metalness={0.16} roughness={0.54} />
        </mesh>

        <mesh
          castShadow
          position={[-yokeWidth * 0.24, worldHeight * 0.018, 0]}
          receiveShadow
          rotation={[0, 0, -0.18]}
        >
          <cylinderGeometry args={[0.015, 0.015, worldHeight * 0.072, 18]} />
          <meshStandardMaterial color={WIPER_STAGE_YOKE_COLOR} metalness={0.16} roughness={0.54} />
        </mesh>

        <mesh
          castShadow
          position={[yokeWidth * 0.24, worldHeight * 0.018, 0]}
          receiveShadow
          rotation={[0, 0, 0.18]}
        >
          <cylinderGeometry args={[0.015, 0.015, worldHeight * 0.072, 18]} />
          <meshStandardMaterial color={WIPER_STAGE_YOKE_COLOR} metalness={0.16} roughness={0.54} />
        </mesh>
      </group>
    </>
  );
}
