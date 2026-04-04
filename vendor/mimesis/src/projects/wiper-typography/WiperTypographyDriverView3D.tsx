"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import {
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
  startTransition,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  type BufferGeometry,
  type Object3D,
  type PerspectiveCamera,
} from "three";
import {
  DoubleSide,
  LinearFilter,
  PCFShadowMap,
  SRGBColorSpace,
} from "three/src/constants.js";
import { Box3 } from "three/src/math/Box3.js";
import { Vector3 } from "three/src/math/Vector3.js";
import { CanvasTexture } from "three/src/textures/CanvasTexture.js";
import type { InteractiveProjectProps } from "../types";
import styles from "./WiperTypographyProject.module.css";
import WiperTypographyTeslaModel, {
  TESLA_DRIVER_VIEW_MODEL_PATH,
} from "./WiperTypographyTeslaModel";
import { useTeslaDriverViewGui } from "./useTeslaDriverViewGui";
import {
  useWiperInteraction,
  type WiperViewRefValue,
} from "./useWiperInteraction";
import { useWiperSceneSimulation3D } from "./useWiperSceneSimulation3D";
import { WIPER_DRIVER_VIEW_OUTSIDE_COLOR } from "./wiperConfig";
import {
  computeDriverViewPhase,
  getDriverViewCycleDuration,
} from "./wiperDriverView";
import { drawWiperScene } from "./wiperSceneRenderer";
import { stepWiperSimulationState } from "./wiperSimulation";
import {
  createTeslaDriverGlyphQuaternion,
  createTeslaDriverViewLayout,
  createTeslaDriverViewPlaneFromPoints,
  getTeslaDriverWiperRotation,
  type TeslaDriverViewLayout,
} from "./wiperTeslaDriverLayout";
import {
  clampTeslaDriverViewFov,
  DEFAULT_TESLA_DRIVER_VIEW_TUNING,
  type TeslaDriverViewTuning,
} from "./wiperTeslaDriverTuning";
import {
  resolveWiperDriverViewPerformanceSettings,
  type WiperDriverViewPerformancePreset,
} from "./wiperDriverViewPerformance";
import {
  applyDriverViewCameraOffset,
  stepViewAngleToward,
  type WiperViewAngle,
} from "./wiperView";

type WindshieldOverlayMesh = Object3D;
type DriverViewAssetState = "checking" | "available" | "missing";
interface DriverViewOverlayAssets {
  canvas: HTMLCanvasElement;
  texture: CanvasTexture;
}

const DRIVER_WINDSHIELD_OVERLAY_PLACEHOLDER: [number, number, number] = [
  0, -10, 0,
];
const DRIVER_VIEW_INITIAL_CAMERA_POSITION: [number, number, number] = [
  -0.41, 0.47, -0.43,
];
const DRIVER_VIEW_INITIAL_LOOK_AT: [number, number, number] = [
  -0.23, 0.56, -0.82,
];
const DRIVER_VIEW_INITIAL_FOV = clampTeslaDriverViewFov(
  DEFAULT_TESLA_DRIVER_VIEW_TUNING.fov,
);
const DRIVER_VIEW_DRAG_SMOOTHING = 0.1;
const DRIVER_VIEW_CANVAS_SHADOWS = { type: PCFShadowMap } as const;
const THREE_CLOCK_WARNING_FILTER_FLAG = "__mimesisThreeClockWarningFilter";

function suppressThreeClockDeprecationWarning() {
  if (process.env.NODE_ENV === "production" || typeof console === "undefined") {
    return;
  }

  const currentWarn = console.warn as typeof console.warn & {
    [THREE_CLOCK_WARNING_FILTER_FLAG]?: boolean;
  };

  if (currentWarn[THREE_CLOCK_WARNING_FILTER_FLAG]) {
    return;
  }

  const wrappedWarn = (...args: unknown[]) => {
    const message = args[0];

    if (typeof message === "string" && message.includes("THREE.Clock:")) {
      return;
    }

    currentWarn(...args);
  };

  wrappedWarn[THREE_CLOCK_WARNING_FILTER_FLAG] = true;
  console.warn = wrappedWarn;
}

function addVector3(
  [ax, ay, az]: [number, number, number],
  [bx, by, bz]: [number, number, number],
): [number, number, number] {
  return [ax + bx, ay + by, az + bz];
}

function scaleVector3(
  [x, y, z]: [number, number, number],
  scalar: number,
): [number, number, number] {
  return [x * scalar, y * scalar, z * scalar];
}

function createDriverViewOverlayCenter(
  layout: TeslaDriverViewLayout,
): [number, number, number] {
  return addVector3(
    layout.windscreenCenter,
    addVector3(
      scaleVector3(
        layout.verticalAxis,
        (layout.glyphYBias - 0.5) * layout.glyphVisibleHeight,
      ),
      scaleVector3(layout.normalAxis, layout.glyphDepthOffset),
    ),
  );
}

function syncDriverViewOverlayCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  pixelWidth: number,
  pixelHeight: number,
  {
    overlayTextureMaxSize,
    overlayTextureScale,
  }: Pick<
    ReturnType<typeof resolveWiperDriverViewPerformanceSettings>,
    "overlayTextureMaxSize" | "overlayTextureScale"
  >,
) {
  const safePixelWidth = Math.max(pixelWidth, 1);
  const safePixelHeight = Math.max(pixelHeight, 1);
  const textureScale = Math.max(
    1,
    Math.min(
      overlayTextureScale,
      overlayTextureMaxSize / safePixelWidth,
      overlayTextureMaxSize / safePixelHeight,
    ),
  );
  const textureWidth = Math.max(1, Math.round(safePixelWidth * textureScale));
  const textureHeight = Math.max(1, Math.round(safePixelHeight * textureScale));

  if (canvas.width !== textureWidth || canvas.height !== textureHeight) {
    canvas.width = textureWidth;
    canvas.height = textureHeight;
  }

  context.setTransform(
    textureWidth / safePixelWidth,
    0,
    0,
    textureHeight / safePixelHeight,
    0,
    0,
  );
  context.imageSmoothingEnabled = true;
}

function DriverViewGuiController({
  setTuning,
  tuning,
}: {
  setTuning: Dispatch<SetStateAction<TeslaDriverViewTuning>>;
  tuning: TeslaDriverViewTuning;
}) {
  useTeslaDriverViewGui({
    enabled: true,
    setTuning,
    tuning,
  });

  return null;
}

function DriverViewGlyphField({
  fovRef,
  onSceneReady,
  performance,
  phaseRef,
  reducedMotion,
  tuning,
  viewRef,
}: {
  fovRef: MutableRefObject<number | null>;
  onSceneReady: () => void;
  performance: ReturnType<typeof resolveWiperDriverViewPerformanceSettings>;
  phaseRef: MutableRefObject<number>;
  reducedMotion: boolean;
  tuning: TeslaDriverViewTuning;
  viewRef: MutableRefObject<WiperViewRefValue>;
}) {
  const overlayMeshRef = useRef<WindshieldOverlayMesh | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const overlayTextureRef = useRef<CanvasTexture | null>(null);
  const teslaSceneRef = useRef<Object3D | null>(null);
  const wiperDummyRef = useRef<Object3D | null>(null);
  const layoutRef = useRef<TeslaDriverViewLayout | null>(null);
  const smoothedViewRef = useRef<WiperViewAngle>({ yaw: 0, pitch: 0 });
  const { pixelHeight, pixelWidth, simulation } = useWiperSceneSimulation3D({
    particleCount: performance.particleCount,
    widthRatio: 0.74,
    heightRatio: 0.62,
  });
  const cycleDuration = getDriverViewCycleDuration(reducedMotion);
  const scratchBoxRef = useRef(new Box3());
  const scratchCenterRef = useRef(new Vector3());
  const scratchPlanePointRef = useRef(new Vector3());
  const scratchSizeRef = useRef(new Vector3());
  const scratchSteeringPositionRef = useRef(new Vector3());
  const overlayAssets = useMemo<DriverViewOverlayAssets | null>(() => {
    if (typeof document === "undefined") {
      return null;
    }

    const canvas = document.createElement("canvas");
    const texture = new CanvasTexture(canvas);

    texture.colorSpace = SRGBColorSpace;
    texture.generateMipmaps = false;
    texture.magFilter = LinearFilter;
    texture.minFilter = LinearFilter;

    return { canvas, texture };
  }, []);

  useEffect(() => {
    layoutRef.current = null;
  }, [tuning]);

  useEffect(() => {
    overlayCanvasRef.current = overlayAssets?.canvas ?? null;
    overlayTextureRef.current = overlayAssets?.texture ?? null;

    return () => {
      overlayCanvasRef.current = null;
      overlayContextRef.current = null;
      overlayTextureRef.current = null;
      overlayAssets?.texture.dispose();
    };
  }, [overlayAssets]);

  const syncLayoutFromScene = useCallback(() => {
    const scene = teslaSceneRef.current;
    if (!scene) {
      return null;
    }

    const steeringDummy = scene.getObjectByName("steering_dummy");
    const windscreenMesh = (scene.getObjectByName("windscreen_ok_glass0_0") ??
      scene.getObjectByName("windscreen_ok_glass.0_0")) as
      | (Object3D & { geometry?: BufferGeometry })
      | null;
    const wiperDummy = scene.getObjectByName("dvornik_dummy");

    if (!steeringDummy || !windscreenMesh || !wiperDummy) {
      return null;
    }

    scene.updateMatrixWorld(true);

    const steeringPosition = steeringDummy.getWorldPosition(
      scratchSteeringPositionRef.current,
    );
    const windscreenBox = scratchBoxRef.current.setFromObject(windscreenMesh);
    const windscreenCenter = windscreenBox.getCenter(scratchCenterRef.current);
    const windscreenSize = windscreenBox.getSize(scratchSizeRef.current);
    const windscreenGeometry = windscreenMesh.geometry;
    const windscreenPlane =
      windscreenGeometry != null
        ? (() => {
            const positionAttribute =
              windscreenGeometry.getAttribute("position");

            if (!positionAttribute) {
              return undefined;
            }

            const scratchPoint = scratchPlanePointRef.current;
            const points: Array<[number, number, number]> = [];

            for (let index = 0; index < positionAttribute.count; index += 1) {
              scratchPoint
                .set(
                  positionAttribute.getX(index),
                  positionAttribute.getY(index),
                  positionAttribute.getZ(index),
                )
                .applyMatrix4(windscreenMesh.matrixWorld);
              points.push([scratchPoint.x, scratchPoint.y, scratchPoint.z]);
            }

            return createTeslaDriverViewPlaneFromPoints({
              driverPosition: steeringPosition.toArray() as [
                number,
                number,
                number,
              ],
              points,
            });
          })()
        : undefined;

    layoutRef.current = createTeslaDriverViewLayout(
      {
        steeringPosition: steeringPosition.toArray() as [
          number,
          number,
          number,
        ],
        windscreenCenter: windscreenCenter.toArray() as [
          number,
          number,
          number,
        ],
        windscreenPlane,
        windscreenSize: windscreenSize.toArray() as [number, number, number],
      },
      tuning,
    );
    wiperDummyRef.current = wiperDummy;

    return layoutRef.current;
  }, [tuning]);

  useFrame((state) => {
    const layout = layoutRef.current ?? syncLayoutFromScene();
    const phase = computeDriverViewPhase(
      state.clock.getElapsedTime(),
      cycleDuration,
    );
    phaseRef.current = phase;
    const perspectiveCamera = state.camera as PerspectiveCamera;
    const clampedFov = clampTeslaDriverViewFov(fovRef.current ?? tuning.fov);

    if (perspectiveCamera.fov !== clampedFov) {
      perspectiveCamera.fov = clampedFov;
      perspectiveCamera.updateProjectionMatrix();
    }

    if (!layout) {
      return;
    }

    smoothedViewRef.current = stepViewAngleToward(
      smoothedViewRef.current,
      viewRef.current,
      DRIVER_VIEW_DRAG_SMOOTHING,
    );
    const pose = applyDriverViewCameraOffset(layout, smoothedViewRef.current);

    state.camera.position.set(...pose.position);
    state.camera.lookAt(...pose.lookAt);

    if (wiperDummyRef.current) {
      wiperDummyRef.current.rotation.x = getTeslaDriverWiperRotation(phase);
    }

    stepWiperSimulationState(simulation, phase);

    if (overlayMeshRef.current) {
      overlayMeshRef.current.position.set(
        ...createDriverViewOverlayCenter(layout),
      );
      overlayMeshRef.current.quaternion.copy(
        createTeslaDriverGlyphQuaternion(layout, 0),
      );
      overlayMeshRef.current.scale.set(
        layout.glyphVisibleWidth,
        layout.glyphVisibleHeight,
        1,
      );
    }

    const overlayCanvas = overlayCanvasRef.current;
    const overlayTexture = overlayTextureRef.current;

    if (!overlayCanvas || !overlayTexture) {
      return;
    }

    let overlayContext = overlayContextRef.current;

    if (!overlayContext) {
      overlayContext = overlayCanvas.getContext("2d");
      overlayContextRef.current = overlayContext;
    }

    if (!overlayContext) {
      return;
    }

    syncDriverViewOverlayCanvas(
      overlayCanvas,
      overlayContext,
      pixelWidth,
      pixelHeight,
      performance,
    );
    overlayTexture.anisotropy = state.gl.capabilities.getMaxAnisotropy();
    drawWiperScene(overlayContext, simulation);
    overlayTexture.needsUpdate = true;
  });

  return (
    <>
      <WiperTypographyTeslaModel
        onReady={(scene) => {
          teslaSceneRef.current = scene;
          layoutRef.current = null;
          onSceneReady();
        }}
      />
      <mesh
        data-driver-view-part="windshield-overlay"
        position={DRIVER_WINDSHIELD_OVERLAY_PLACEHOLDER}
        ref={(node) => {
          overlayMeshRef.current = node;
        }}
        renderOrder={2}
        scale={[0.001, 0.001, 1]}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          depthWrite={false}
          map={overlayAssets?.texture ?? undefined}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
          side={DoubleSide}
          toneMapped={false}
          transparent
        />
      </mesh>
    </>
  );
}

function DriverViewFallback({ projectId }: { projectId: string }) {
  return (
    <div
      className={`${styles.wrapper} ${styles.placeholder3D}`}
      data-project-id={projectId}
      role="img"
      aria-label="Tesla driver view wiper typography simulation"
    >
      <div className={styles.placeholderTitle}>3D driver view unavailable</div>
      <div className={styles.placeholderBody}>
        Add the local Tesla export at{" "}
        <code>/public/models/tesla_2018_model_3.glb</code> to enable this mode.
      </div>
    </div>
  );
}

function DriverViewLoading({
  body,
  projectId,
}: {
  body: string;
  projectId: string;
}) {
  return (
    <div
      className={`${styles.wrapper} ${styles.placeholder3D}`}
      data-project-id={projectId}
      role="img"
      aria-label="Tesla driver view wiper typography simulation"
    >
      <div className={styles.placeholderTitle}>Preparing 3D driver view</div>
      <div className={styles.placeholderBody}>{body}</div>
    </div>
  );
}

function DriverViewLoadingOverlay() {
  return (
    <div
      className={`${styles.placeholder3D} ${styles.driverViewLoadingOverlay}`}
    >
      <div className={styles.placeholderTitle}>Preparing 3D driver view</div>
      <div className={styles.placeholderBody}>
        Loading the Tesla cabin scene.
      </div>
    </div>
  );
}

function DriverViewScene({
  fovRef,
  onSceneReady,
  performance,
  reducedMotion,
  tuning,
  viewRef,
}: {
  fovRef: MutableRefObject<number | null>;
  onSceneReady: () => void;
  performance: ReturnType<typeof resolveWiperDriverViewPerformanceSettings>;
  reducedMotion: boolean;
  tuning: TeslaDriverViewTuning;
  viewRef: MutableRefObject<WiperViewRefValue>;
}) {
  const phaseRef = useRef(0);

  return (
    <>
      <color attach="background" args={[WIPER_DRIVER_VIEW_OUTSIDE_COLOR]} />
      <ambientLight intensity={reducedMotion ? 0.95 : 0.8} />
      <directionalLight castShadow intensity={1.1} position={[4, 6, 5]} />
      <Suspense fallback={null}>
        <DriverViewGlyphField
          fovRef={fovRef}
          onSceneReady={onSceneReady}
          performance={performance}
          phaseRef={phaseRef}
          reducedMotion={reducedMotion}
          tuning={tuning}
          viewRef={viewRef}
        />
      </Suspense>
    </>
  );
}

interface WiperTypographyDriverView3DProps extends InteractiveProjectProps {
  performancePreset?: WiperDriverViewPerformancePreset;
}

export default function WiperTypographyDriverView3D({
  performancePreset = "default",
  projectId,
}: WiperTypographyDriverView3DProps) {
  suppressThreeClockDeprecationWarning();

  const performance =
    resolveWiperDriverViewPerformanceSettings(performancePreset);
  const reducedMotion = useReducedMotion() ?? false;
  const [assetState, setAssetState] =
    useState<DriverViewAssetState>("checking");
  const [sceneReady, setSceneReady] = useState(false);
  const [tuning, setTuning] = useState<TeslaDriverViewTuning>(() => ({
    ...DEFAULT_TESLA_DRIVER_VIEW_TUNING,
  }));
  const { containerRef, dragLayerRef, dragLayerProps, fovRef, viewRef } =
    useWiperInteraction({
      interactionMode: "driver-view-camera",
      initialFov: tuning.fov,
      margin: 0,
    });

  const handleSceneReady = useCallback(() => {
    startTransition(() => {
      setSceneReady(true);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function verifyAsset() {
      if (typeof fetch !== "function") {
        if (!cancelled) {
          setAssetState("missing");
        }
        return;
      }

      try {
        const response = await fetch(TESLA_DRIVER_VIEW_MODEL_PATH, {
          method: "HEAD",
        });

        if (!cancelled) {
          setAssetState(response.ok ? "available" : "missing");
        }
      } catch {
        if (!cancelled) {
          setAssetState("missing");
        }
      }
    }

    void verifyAsset();

    return () => {
      cancelled = true;
    };
  }, []);

  if (assetState === "checking") {
    return (
      <DriverViewLoading
        body="Checking the local Tesla model asset."
        projectId={projectId}
      />
    );
  }

  if (assetState === "missing") {
    return <DriverViewFallback projectId={projectId} />;
  }

  return (
    <div
      className={styles.wrapper}
      data-project-id={projectId}
      ref={containerRef}
      role="img"
      aria-label="Tesla driver view wiper typography simulation"
    >
      <DriverViewGuiController setTuning={setTuning} tuning={tuning} />

      {!sceneReady ? <DriverViewLoadingOverlay /> : null}

      <Canvas
        camera={{
          position: DRIVER_VIEW_INITIAL_CAMERA_POSITION,
          fov: clampTeslaDriverViewFov(tuning.fov ?? DRIVER_VIEW_INITIAL_FOV),
          near: 0.01,
          far: 30,
        }}
        dpr={performance.canvasDpr}
        onCreated={({ camera }) => {
          camera.lookAt(...DRIVER_VIEW_INITIAL_LOOK_AT);
        }}
        shadows={DRIVER_VIEW_CANVAS_SHADOWS}
        style={{ inset: 0, position: "absolute" }}
      >
        <DriverViewScene
          fovRef={fovRef}
          onSceneReady={handleSceneReady}
          performance={performance}
          reducedMotion={reducedMotion}
          tuning={tuning}
          viewRef={viewRef}
        />
      </Canvas>
      <div
        className={`${styles.dragLayer} ${styles.driverViewDragLayer}`}
        data-driver-view-part="interaction-layer"
        ref={dragLayerRef}
        {...dragLayerProps}
      />
    </div>
  );
}
