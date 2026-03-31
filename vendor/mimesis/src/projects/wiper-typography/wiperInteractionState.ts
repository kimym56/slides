import {
  mapPointerDragToPhase,
  mapPointerXToPhase,
} from "./wiperMath";
import {
  mapDragDeltaToViewAngle,
  mapWheelDeltaToDriverViewFov,
  type WiperViewAngle,
} from "./wiperView";

export interface WiperInteractionState {
  fov: number | null;
  pointerTargetPhase: number;
  frozenPhase: number | null;
  isDraggingView: boolean;
  dragStartX: number;
  dragStartY: number;
  dragStartView: WiperViewAngle;
  view: WiperViewAngle;
  isTouchDraggingPhase: boolean;
  touchDragStartX: number;
  touchDragStartPhase: number;
}

export function createWiperInteractionState(
  initialFov: number | null = null
): WiperInteractionState {
  return {
    fov: initialFov,
    pointerTargetPhase: 0,
    frozenPhase: null,
    isDraggingView: false,
    dragStartX: 0,
    dragStartY: 0,
    dragStartView: { yaw: 0, pitch: 0 },
    view: { yaw: 0, pitch: 0 },
    isTouchDraggingPhase: false,
    touchDragStartX: 0,
    touchDragStartPhase: 0,
  };
}

export function handleDesktopHoverMove(
  state: WiperInteractionState,
  input: { pointerX: number; width: number; margin: number }
): WiperInteractionState {
  return {
    ...state,
    frozenPhase: null,
    pointerTargetPhase: mapPointerXToPhase(input.pointerX, input.width, input.margin),
  };
}

export function beginDesktopCameraControlDrag(
  state: WiperInteractionState,
  input: { pointerX: number; pointerY: number }
): WiperInteractionState {
  return {
    ...state,
    frozenPhase: null,
    isDraggingView: true,
    dragStartX: input.pointerX,
    dragStartY: input.pointerY,
    dragStartView: state.view,
  };
}

export function beginDesktopViewDrag(
  state: WiperInteractionState,
  input: { pointerX: number; pointerY: number; phase: number }
): WiperInteractionState {
  return {
    ...state,
    pointerTargetPhase: input.phase,
    frozenPhase: input.phase,
    isDraggingView: true,
    dragStartX: input.pointerX,
    dragStartY: input.pointerY,
    dragStartView: state.view,
  };
}

export function updateDesktopViewDrag(
  state: WiperInteractionState,
  input: { pointerX: number; pointerY: number; width: number; height: number }
): WiperInteractionState {
  if (!state.isDraggingView) {
    return state;
  }

  return {
    ...state,
    pointerTargetPhase: state.frozenPhase ?? state.pointerTargetPhase,
    view: mapDragDeltaToViewAngle(state.dragStartView, {
      deltaX: input.pointerX - state.dragStartX,
      deltaY: input.pointerY - state.dragStartY,
      width: input.width,
      height: input.height,
    }),
  };
}

export function endDesktopViewDrag(
  state: WiperInteractionState
): WiperInteractionState {
  return {
    ...state,
    frozenPhase: null,
    isDraggingView: false,
  };
}

export function updateDesktopWheelZoom(
  state: WiperInteractionState,
  input: { deltaY: number; fov: number }
): WiperInteractionState {
  return {
    ...state,
    fov: mapWheelDeltaToDriverViewFov(input.fov, input.deltaY),
  };
}

export function primeTouchPhaseDrag(
  state: WiperInteractionState,
  input: { pointerX: number; phase: number }
): WiperInteractionState {
  return {
    ...state,
    pointerTargetPhase: input.phase,
    isTouchDraggingPhase: true,
    touchDragStartX: input.pointerX,
    touchDragStartPhase: input.phase,
  };
}

export function updateTouchPhaseDrag(
  state: WiperInteractionState,
  input: { pointerX: number; width: number; margin: number }
): WiperInteractionState {
  if (!state.isTouchDraggingPhase) {
    return state;
  }

  return {
    ...state,
    pointerTargetPhase: mapPointerDragToPhase(
      input.pointerX,
      state.touchDragStartX,
      state.touchDragStartPhase,
      input.width,
      input.margin
    ),
  };
}
