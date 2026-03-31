// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PageCurlEmbed3D from "./PageCurlEmbed3D";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { mockedCanvasState } = vi.hoisted(() => ({
  mockedCanvasState: {
    propsHistory: [] as Array<Record<string, unknown>>,
  },
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: ({
    ...props
  }: {
    children?: React.ReactNode;
  } & Record<string, unknown>) => {
    mockedCanvasState.propsHistory.push(props);
    return <div data-testid="mock-canvas" />;
  },
  useFrame: () => undefined,
  useThree: () => ({
    viewport: { height: 1, width: 1 },
  }),
}));

vi.mock("@react-three/drei", () => ({
  useTexture: () => ({
    image: { height: 1024, width: 1024 },
  }),
}));

describe("PageCurlEmbed3D", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mockedCanvasState.propsHistory = [];
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("keeps the default canvas pixel ratio when no performance preset is requested", () => {
    act(() => {
      root.render(<PageCurlEmbed3D />);
    });

    expect(mockedCanvasState.propsHistory[0]).not.toHaveProperty("dpr");
  });

  it("reduces canvas pixel ratio for slide embeds", () => {
    act(() => {
      root.render(<PageCurlEmbed3D performancePreset="slides" />);
    });

    expect(mockedCanvasState.propsHistory[0]).toMatchObject({
      dpr: 1,
    });
  });
});
