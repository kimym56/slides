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
import WiperTypographyDriverView3D from "./WiperTypographyDriverView3D";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

const {
  mockedExtrudedGlyph,
  mockedTeslaModel,
} = vi.hoisted(() => ({
  mockedExtrudedGlyph: vi.fn(() => <div data-testid="extruded-glyph" />),
  mockedTeslaModel: vi.fn(() => <div data-driver-view-part="tesla-model" />),
}));

const { mockedFetch } = vi.hoisted(() => ({
  mockedFetch: vi.fn(),
}));

vi.mock("./WiperTypographyTeslaModel", () => ({
  default: mockedTeslaModel,
  TESLA_DRIVER_VIEW_MODEL_PATH: "/models/tesla_2018_model_3.glb",
}));

vi.mock("./WiperTypographyExtrudedGlyph3D", () => ({
  default: mockedExtrudedGlyph,
}));

vi.mock("./useWiperSceneSimulation3D", () => ({
  useWiperSceneSimulation3D: vi.fn(() => ({
    glyphScale: 0.33,
    pixelHeight: 100,
    pixelWidth: 100,
    projectX: (value: number) => value,
    projectY: (value: number) => value,
    scale: 0.01,
    simulation: {
      bars: [
        {
          height: 8,
          index: 0,
          kind: "bar",
          radius: 25,
          rotation: 0.15,
          vx: 0,
          vy: 0,
          width: 50,
          x: 35,
          y: 55,
        },
      ],
      glyphs: [
        {
          index: 0,
          kind: "glyph",
          radius: 20,
          rotation: 0,
          text: "T",
          vx: 0,
          vy: 0,
          x: 10,
          y: 20,
        },
      ],
    },
    worldHeight: 100,
    worldWidth: 100,
  })),
}));

vi.mock("@react-three/drei", () => ({
  Html: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@react-three/fiber", () => ({
  Canvas: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  useFrame: () => undefined,
}));

describe("WiperTypographyScene3DGlyphWiring", () => {
  beforeEach(() => {
    mockedExtrudedGlyph.mockClear();
    mockedTeslaModel.mockClear();
    mockedFetch.mockReset();
    mockedFetch.mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", mockedFetch);
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.unstubAllGlobals();
    consoleErrorSpy.mockRestore();
  });

  it("composes the tesla model and one windshield overlay in the driver view", async () => {
    await act(async () => {
      root.render(<WiperTypographyDriverView3D projectId="wiper-typography" />);
      await Promise.resolve();
    });

    expect(mockedTeslaModel).toHaveBeenCalled();
    expect(mockedExtrudedGlyph).not.toHaveBeenCalled();
    expect(container.querySelector('[data-driver-view-part="tesla-model"]')).not.toBeNull();
    expect(container.querySelector('[data-driver-view-part="windshield-overlay"]')).not.toBeNull();
  });
});
