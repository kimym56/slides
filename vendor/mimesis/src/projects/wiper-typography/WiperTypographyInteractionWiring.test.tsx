// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import WiperTypographyCanvas2D from "./WiperTypographyCanvas2D";
import WiperTypographySceneFrame from "./WiperTypographySceneFrame";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { mockedUseWiperInteraction } = vi.hoisted(() => ({
  mockedUseWiperInteraction: vi.fn(() => ({
    containerRef: { current: null },
    dragLayerRef: { current: null },
    phaseRef: { current: 0 },
    sizeRef: { current: { width: 1, height: 1 } },
    viewRef: { current: { yaw: 0, pitch: 0, isDraggingView: false } },
    reducedMotion: false,
    tick: () => 0,
    dragLayerProps: {
      onPointerEnter: vi.fn(),
      onPointerMove: vi.fn(),
      onPointerDown: vi.fn(),
      onPointerUp: vi.fn(),
      onPointerLeave: vi.fn(),
      onPointerCancel: vi.fn(),
    },
  })),
}));

vi.mock("./useWiperInteraction", () => ({
  useWiperInteraction: mockedUseWiperInteraction,
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: () => <div>mock-canvas</div>,
  useFrame: () => undefined,
}));

describe("WiperTypographyInteractionWiring", () => {
  let container: HTMLDivElement;
  let root: Root;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;

  beforeEach(() => {
    mockedUseWiperInteraction.mockClear();
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  it("uses legacy phase interaction for 2d and desktop split interaction for 3d", () => {
    act(() => {
      root.render(
        <>
          <WiperTypographyCanvas2D projectId="wiper-typography" />
          <WiperTypographySceneFrame
            projectId="wiper-typography"
            renderScene={() => <div>scene</div>}
          />
        </>
      );
    });

    expect(mockedUseWiperInteraction).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ interactionMode: "legacy-phase" })
    );
    expect(mockedUseWiperInteraction).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ interactionMode: "desktop-view-drag" })
    );
  });
});
