"use client";

import { useReducedMotion } from "framer-motion";
import {
  useEffect,
  useRef,
  type MutableRefObject,
  type PointerEventHandler,
  type RefObject,
  type WheelEventHandler,
} from "react";
import {
  WIPER_AUTOPLAY_SPEED,
  WIPER_POINTER_PHASE_MAX_DELTA,
} from "./wiperConfig";
import {
  beginDesktopCameraControlDrag,
  beginDesktopViewDrag,
  createWiperInteractionState,
  endDesktopViewDrag,
  handleDesktopHoverMove,
  primeTouchPhaseDrag,
  updateDesktopViewDrag,
  updateDesktopWheelZoom,
  updateTouchPhaseDrag,
} from "./wiperInteractionState";
import {
  WIPER_MARGIN,
  isPointerInsideActiveRange,
  mapPointerDragToPhase,
} from "./wiperMath";
import {
  stepIdlePhase,
  stepInteractivePhase,
  syncAutoplayAngle,
} from "./wiperPhase";

interface WiperSize {
  width: number;
  height: number;
}

export type WiperInteractionMode =
  | "legacy-phase"
  | "desktop-view-drag"
  | "driver-view-camera";

export interface WiperViewRefValue {
  yaw: number;
  pitch: number;
  isDraggingView: boolean;
}

interface UseWiperInteractionOptions {
  margin?: number;
  autoplaySpeed?: number;
  maxDelta?: number;
  interactionMode?: WiperInteractionMode;
  initialFov?: number;
}

export interface WiperInteractionModel {
  containerRef: RefObject<HTMLDivElement | null>;
  dragLayerRef: RefObject<HTMLDivElement | null>;
  fovRef: MutableRefObject<number | null>;
  phaseRef: MutableRefObject<number>;
  sizeRef: MutableRefObject<WiperSize>;
  viewRef: MutableRefObject<WiperViewRefValue>;
  reducedMotion: boolean;
  tick: () => number;
  dragLayerProps: {
    onPointerEnter: PointerEventHandler<HTMLDivElement>;
    onPointerMove: PointerEventHandler<HTMLDivElement>;
    onPointerDown: PointerEventHandler<HTMLDivElement>;
    onPointerUp: PointerEventHandler<HTMLDivElement>;
    onPointerLeave: PointerEventHandler<HTMLDivElement>;
    onPointerCancel: PointerEventHandler<HTMLDivElement>;
    onWheel: WheelEventHandler<HTMLDivElement>;
  };
}

export function useWiperInteraction(
  options: UseWiperInteractionOptions = {},
): WiperInteractionModel {
  const {
    margin = WIPER_MARGIN,
    autoplaySpeed = WIPER_AUTOPLAY_SPEED,
    maxDelta = WIPER_POINTER_PHASE_MAX_DELTA,
    interactionMode = "legacy-phase",
    initialFov,
  } = options;

  const prefersReducedMotion = useReducedMotion() ?? false;

  const containerRef = useRef<HTMLDivElement>(null);
  const dragLayerRef = useRef<HTMLDivElement>(null);
  const fovRef = useRef<number | null>(initialFov ?? null);
  const phaseRef = useRef(0);
  const sizeRef = useRef<WiperSize>({ width: 1, height: 1 });
  const viewRef = useRef<WiperViewRefValue>({
    yaw: 0,
    pitch: 0,
    isDraggingView: false,
  });
  const autoPhaseAngleRef = useRef(0);
  const pointerOnStageRef = useRef(false);
  const pointerTargetPhaseRef = useRef(0);
  const pointerDragStartXRef = useRef(0);
  const pointerDragStartPhaseRef = useRef(0);
  const pointerDragPrimedRef = useRef(false);
  const interactionStateRef = useRef(
    createWiperInteractionState(initialFov ?? null),
  );

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      const rect = element.getBoundingClientRect();
      sizeRef.current = {
        width: Math.max(1, rect.width),
        height: Math.max(1, rect.height),
      };
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const syncSizeFromElement = (element?: Element | null): WiperSize => {
    const fallbackElement = containerRef.current;
    const measuredElement =
      (element instanceof HTMLElement ? element : null) ?? fallbackElement;

    if (!measuredElement) {
      return sizeRef.current;
    }

    const rect = measuredElement.getBoundingClientRect();
    const nextSize = {
      width: Math.max(1, rect.width),
      height: Math.max(1, rect.height),
    };

    sizeRef.current = nextSize;
    return nextSize;
  };

  const syncInteractionState = (
    nextState: ReturnType<typeof createWiperInteractionState>,
  ) => {
    interactionStateRef.current = nextState;
    pointerTargetPhaseRef.current = nextState.pointerTargetPhase;
    fovRef.current = nextState.fov;
    viewRef.current = {
      yaw: nextState.view.yaw,
      pitch: nextState.view.pitch,
      isDraggingView: nextState.isDraggingView,
    };
  };

  useEffect(() => {
    if (interactionMode !== "driver-view-camera") {
      return;
    }

    const target = dragLayerRef.current ?? containerRef.current;
    if (!target) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      syncInteractionState(
        updateDesktopWheelZoom(interactionStateRef.current, {
          deltaY: event.deltaY,
          fov: fovRef.current ?? initialFov ?? 0,
        }),
      );
    };

    target.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      target.removeEventListener("wheel", handleWheel);
    };
  }, [initialFov, interactionMode]);

  const getPointerX = (clientX: number): number => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) {
      return 0;
    }

    return clientX - rect.left;
  };

  const leavePointerMode = () => {
    pointerOnStageRef.current = false;
    pointerDragPrimedRef.current = false;
    autoPhaseAngleRef.current = syncAutoplayAngle(phaseRef.current);
  };

  const onPointerEnter: PointerEventHandler<HTMLDivElement> = () => {
    pointerOnStageRef.current = true;
    pointerTargetPhaseRef.current = phaseRef.current;
    pointerDragPrimedRef.current = false;
  };

  const onPointerMove: PointerEventHandler<HTMLDivElement> = (event) => {
    const measuredSize = syncSizeFromElement(event.currentTarget);
    const pointerX = getPointerX(event.clientX);
    const width = measuredSize.width;

    if (interactionMode === "driver-view-camera") {
      if (viewRef.current.isDraggingView) {
        syncInteractionState(
          updateDesktopViewDrag(interactionStateRef.current, {
            pointerX,
            pointerY: event.clientY,
            width,
            height: measuredSize.height,
          }),
        );
      }
      return;
    }

    if (interactionMode === "desktop-view-drag") {
      if (event.pointerType === "touch") {
        syncInteractionState(
          updateTouchPhaseDrag(interactionStateRef.current, {
            pointerX,
            width,
            margin,
          }),
        );
        return;
      }

      if (viewRef.current.isDraggingView) {
        syncInteractionState(
          updateDesktopViewDrag(interactionStateRef.current, {
            pointerX,
            pointerY: event.clientY,
            width,
            height: measuredSize.height,
          }),
        );
        return;
      }

      if (!isPointerInsideActiveRange(pointerX, width, margin)) {
        if (pointerOnStageRef.current) {
          leavePointerMode();
        }
        return;
      }

      pointerOnStageRef.current = true;
      syncInteractionState(
        handleDesktopHoverMove(interactionStateRef.current, {
          pointerX,
          width,
          margin,
        }),
      );
      return;
    }

    if (!isPointerInsideActiveRange(pointerX, width, margin)) {
      if (pointerOnStageRef.current) {
        leavePointerMode();
      }
      return;
    }

    if (!pointerOnStageRef.current) {
      pointerOnStageRef.current = true;
      pointerTargetPhaseRef.current = phaseRef.current;
      pointerDragPrimedRef.current = false;
      return;
    }

    if (!pointerDragPrimedRef.current) {
      pointerDragStartXRef.current = pointerX;
      pointerDragStartPhaseRef.current = phaseRef.current;
      pointerTargetPhaseRef.current = phaseRef.current;
      pointerDragPrimedRef.current = true;
      return;
    }

    pointerTargetPhaseRef.current = mapPointerDragToPhase(
      pointerX,
      pointerDragStartXRef.current,
      pointerDragStartPhaseRef.current,
      width,
      margin,
    );
  };

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (event) => {
    const measuredSize = syncSizeFromElement(event.currentTarget);

    if (interactionMode === "driver-view-camera") {
      if (event.pointerType === "touch") {
        return;
      }

      syncInteractionState(
        beginDesktopCameraControlDrag(interactionStateRef.current, {
          pointerX: getPointerX(event.clientX),
          pointerY: event.clientY,
        }),
      );
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    if (interactionMode !== "desktop-view-drag") {
      return;
    }

    const pointerX = getPointerX(event.clientX);
    const width = measuredSize.width;

    if (event.pointerType === "touch") {
      pointerOnStageRef.current = true;
      syncInteractionState(
        primeTouchPhaseDrag(interactionStateRef.current, {
          pointerX,
          phase: phaseRef.current,
        }),
      );
      event.currentTarget.setPointerCapture(event.pointerId);
      return;
    }

    if (!isPointerInsideActiveRange(pointerX, width, margin)) {
      return;
    }

    pointerOnStageRef.current = true;
    syncInteractionState(
      beginDesktopViewDrag(interactionStateRef.current, {
        pointerX,
        pointerY: event.clientY,
        phase: phaseRef.current,
      }),
    );
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerUp: PointerEventHandler<HTMLDivElement> = (event) => {
    if (interactionMode === "driver-view-camera") {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      if (viewRef.current.isDraggingView) {
        syncInteractionState(endDesktopViewDrag(interactionStateRef.current));
      }
      return;
    }

    if (interactionMode !== "desktop-view-drag") {
      leavePointerMode();
      return;
    }

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (event.pointerType === "touch") {
      interactionStateRef.current = {
        ...interactionStateRef.current,
        isTouchDraggingPhase: false,
      };
      leavePointerMode();
      return;
    }

    if (viewRef.current.isDraggingView) {
      syncInteractionState(endDesktopViewDrag(interactionStateRef.current));
    }
  };

  const onPointerLeave: PointerEventHandler<HTMLDivElement> = () => {
    if (interactionMode === "driver-view-camera") {
      return;
    }

    if (
      interactionMode === "desktop-view-drag" &&
      viewRef.current.isDraggingView
    ) {
      return;
    }

    leavePointerMode();
  };

  const onPointerCancel: PointerEventHandler<HTMLDivElement> = (event) => {
    if (interactionMode === "driver-view-camera") {
      if (viewRef.current.isDraggingView) {
        syncInteractionState(endDesktopViewDrag(interactionStateRef.current));
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      return;
    }

    if (
      interactionMode === "desktop-view-drag" &&
      viewRef.current.isDraggingView
    ) {
      syncInteractionState(endDesktopViewDrag(interactionStateRef.current));
    }

    if (
      interactionMode === "desktop-view-drag" &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    interactionStateRef.current = {
      ...interactionStateRef.current,
      isTouchDraggingPhase: false,
    };
    leavePointerMode();
  };

  const onWheel: WheelEventHandler<HTMLDivElement> = () => {};

  const tick = (): number => {
    if (interactionMode === "desktop-view-drag") {
      if (viewRef.current.isDraggingView) {
        return phaseRef.current;
      }

      if (
        pointerOnStageRef.current ||
        interactionStateRef.current.isTouchDraggingPhase
      ) {
        phaseRef.current = stepInteractivePhase(
          phaseRef.current,
          pointerTargetPhaseRef.current,
          maxDelta,
        );
        return phaseRef.current;
      }
    } else if (pointerOnStageRef.current) {
      phaseRef.current = stepInteractivePhase(
        phaseRef.current,
        pointerTargetPhaseRef.current,
        maxDelta,
      );
      return phaseRef.current;
    }

    const next = stepIdlePhase(autoPhaseAngleRef.current, autoplaySpeed);
    autoPhaseAngleRef.current = next.autoPhaseAngle;
    phaseRef.current = next.phase;

    return phaseRef.current;
  };

  return {
    containerRef,
    dragLayerRef,
    fovRef,
    phaseRef,
    sizeRef,
    viewRef,
    reducedMotion: prefersReducedMotion,
    tick,
    dragLayerProps: {
      onPointerEnter,
      onPointerMove,
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      onWheel,
    },
  };
}
