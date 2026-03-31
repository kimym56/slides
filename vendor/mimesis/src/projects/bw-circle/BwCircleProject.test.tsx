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
import BwCircleProject from "./BwCircleProject";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

vi.mock("framer-motion", () => ({
  useReducedMotion: () => false,
}));

describe("BwCircleProject", () => {
  let container: HTMLDivElement;
  let root: Root;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalRequestAnimationFrame: typeof window.requestAnimationFrame;
  let originalCancelAnimationFrame: typeof window.cancelAnimationFrame;

  beforeAll(() => {
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalRequestAnimationFrame = window.requestAnimationFrame;
    originalCancelAnimationFrame = window.cancelAnimationFrame;

    HTMLCanvasElement.prototype.getContext = vi.fn(
      () =>
        ({
          arc: vi.fn(),
          beginPath: vi.fn(),
          clearRect: vi.fn(),
          clip: vi.fn(),
          fill: vi.fn(),
          fillRect: vi.fn(),
          lineWidth: 0,
          restore: vi.fn(),
          save: vi.fn(),
          scale: vi.fn(),
          setTransform: vi.fn(),
          shadowBlur: 0,
          shadowColor: "",
          shadowOffsetY: 0,
          stroke: vi.fn(),
          translate: vi.fn(),
        }) as unknown as CanvasRenderingContext2D,
    );
    window.requestAnimationFrame = vi.fn(() => 1);
    window.cancelAnimationFrame = vi.fn();
  });

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterAll(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("renders a minimal mimesis scene by default and switches to sync controls", () => {
    act(() => {
      root.render(<BwCircleProject projectId="black-white-circle" />);
    });

    expect(container.textContent).toContain("Mimesis");
    expect(container.textContent).toContain("Sync");
    expect(
      [...container.querySelectorAll("button")].map((button) =>
        button.textContent?.trim(),
      ),
    ).not.toContain("N");
    expect(container.textContent).not.toContain(
      "Tap the scene to arm bounce audio",
    );
    expect(
      container.querySelector(
        'input[placeholder="https://youtu.be/97qr0BOdHkc?si=xgT_cD0WHCGQsn_C"]',
      ),
    ).toBeNull();

    const syncButton = container.querySelector(
      '[data-mode="sync"]',
    ) as HTMLButtonElement | null;

    expect(syncButton).not.toBeNull();

    act(() => {
      syncButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(
      container.querySelector(
        'input[placeholder="https://youtu.be/97qr0BOdHkc?si=xgT_cD0WHCGQsn_C"]',
      ),
    ).not.toBeNull();
    expect(container.textContent).toContain("Play");
    expect(container.textContent).toContain(
      "*Allow permission to use audio sync for this feature.",
    );
    expect(container.querySelector('input[type="number"]')).toBeNull();
    expect(container.textContent).not.toContain("Tap");
    expect(container.textContent).not.toContain("Load");
    expect(
      [...container.querySelectorAll("button")].map((button) =>
        button.textContent?.trim(),
      ),
    ).not.toContain("N");
  });

  it("starts in sync mode when initialMode requests it", () => {
    act(() => {
      root.render(
        <BwCircleProject
          initialMode="sync"
          projectId="black-white-circle"
        />,
      );
    });

    expect(
      container.querySelector(
        'input[placeholder="https://youtu.be/97qr0BOdHkc?si=xgT_cD0WHCGQsn_C"]',
      ),
    ).not.toBeNull();
  });
});
