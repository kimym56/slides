// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import styles from "./WiperTypographyProject.module.css";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { moduleLoadState } = vi.hoisted(() => ({
  moduleLoadState: {
    driverViewLoads: 0,
  },
}));

vi.mock(
  "./WiperTypographyCanvas2D",
  () => ({
    default: () => <div>mock-2d-canvas</div>,
  }),
  { virtual: true }
);

vi.mock(
  "./WiperTypographyDriverView3D",
  () => {
    moduleLoadState.driverViewLoads += 1;

    return {
      default: () => <div>mock-3d-driver-view</div>,
    };
  },
  { virtual: true }
);

describe("WiperTypographyProject", () => {
  let container: HTMLDivElement;
  let root: Root;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;

  beforeAll(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterAll(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("renders 2d canvas by default and only loads the 3d driver view after selection", async () => {
    moduleLoadState.driverViewLoads = 0;
    vi.resetModules();
    const { default: WiperTypographyProject } = await import(
      "./WiperTypographyProject"
    );

    expect(moduleLoadState.driverViewLoads).toBe(0);

    await act(async () => {
      root.render(<WiperTypographyProject projectId="wiper-typography" />);
      await Promise.resolve();
    });

    expect(container.textContent).toContain("mock-2d-canvas");
    expect(container.textContent).toContain("2D Canvas");
    expect(container.textContent).toContain("3D Driver View");
    expect(container.textContent).not.toContain("mock-3d-driver-view");
    expect(moduleLoadState.driverViewLoads).toBe(0);

    const button = container.querySelector(
      '[data-mode="3d-driver"]'
    ) as HTMLButtonElement | null;

    expect(button).not.toBeNull();

    await act(async () => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await vi.dynamicImportSettled();
      await Promise.resolve();
    });

    expect(moduleLoadState.driverViewLoads).toBe(1);
    expect(container.textContent).toContain("mock-3d-driver-view");
  });

  it("starts in 3d driver mode when initialMode requests it", async () => {
    moduleLoadState.driverViewLoads = 0;
    vi.resetModules();
    const { default: WiperTypographyProject } = await import(
      "./WiperTypographyProject"
    );

    await act(async () => {
      root.render(
        <WiperTypographyProject
          initialMode="3d-driver"
          projectId="wiper-typography"
        />,
      );
      await vi.dynamicImportSettled();
      await Promise.resolve();
    });

    expect(
      container.querySelector('[data-mode="3d-driver"]')?.className,
    ).toContain(styles.modeButtonActive);
  });
});
