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
import WiperTypographyCockpitShell3D from "./WiperTypographyCockpitShell3D";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe("WiperTypographyCockpitShell3D", () => {
  let container: HTMLDivElement;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  let root: Root;

  beforeEach(() => {
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
    consoleErrorSpy.mockRestore();
  });

  it("renders the simulator cockpit anchors from the real shell", () => {
    act(() => {
      root.render(
        <WiperTypographyCockpitShell3D
          windshieldY={2}
          windshieldZ={0.08}
          worldHeight={100}
          worldWidth={100}
        />
      );
    });

    expect(container.querySelector('[data-cockpit-role="center-display"]')).not.toBeNull();
    expect(container.querySelector('[data-cockpit-role="yoke"]')).not.toBeNull();
    expect(container.querySelector('[data-cockpit-role="simulator-field"]')).not.toBeNull();
  });
});
