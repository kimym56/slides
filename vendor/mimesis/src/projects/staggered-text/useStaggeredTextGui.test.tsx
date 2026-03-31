// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { useState } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import {
  DEFAULT_STAGGERED_TEXT_TUNING,
} from "./staggeredTextTuning";
import { useStaggeredTextGui } from "./useStaggeredTextGui";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { guiMockState, MockGUI } = vi.hoisted(() => {
  const state = {
    controllers: new Map<
      string,
      {
        setValue: (value: number) => void;
      }
    >(),
    destroyed: 0,
    instances: [] as Array<{ options: Record<string, unknown> }>,
  };

  class MockController {
    private onChangeHandler?: (value: number) => void;

    constructor(
      private target: Record<string, number>,
      private key: string
    ) {}

    name() {
      return this;
    }

    onChange(handler: (value: number) => void) {
      this.onChangeHandler = handler;
      state.controllers.set(this.key, {
        setValue: (value: number) => {
          this.target[this.key] = value;
          this.onChangeHandler?.(value);
        },
      });

      return this;
    }
  }

  class MockFolder {
    add(target: Record<string, number>, key: string) {
      return new MockController(target, key);
    }

    close() {
      return this;
    }
  }

  class GUI {
    constructor(public options: Record<string, unknown>) {
      state.instances.push({ options });
    }

    addFolder() {
      return new MockFolder();
    }

    close() {
      return this;
    }

    destroy() {
      state.destroyed += 1;
    }
  }

  return { guiMockState: state, MockGUI: GUI };
});

vi.mock("lil-gui", () => ({ GUI: MockGUI }), { virtual: true });

function TestHarness({ enabled = true }: { enabled?: boolean }) {
  const [tuning, setTuning] = useState(DEFAULT_STAGGERED_TEXT_TUNING);

  useStaggeredTextGui({
    enabled,
    setTuning,
    tuning,
  });

  return (
    <div
      data-testid="tuning-values"
      data-font-weight={tuning.fontWeight}
      data-letter-spacing={tuning.letterSpacingEm}
      data-outgoing-stagger-step={tuning.outgoingStaggerStepMs}
    />
  );
}

describe("useStaggeredTextGui", () => {
  let container: HTMLDivElement;
  let originalNodeEnv: string | undefined;
  let root: Root;

  beforeEach(() => {
    originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";
    guiMockState.controllers.clear();
    guiMockState.destroyed = 0;
    guiMockState.instances = [];
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("creates and destroys a lil-gui panel in development", async () => {
    await act(async () => {
      root.render(<TestHarness />);
    });
    await vi.dynamicImportSettled();
    await act(async () => {
      await Promise.resolve();
    });

    expect(guiMockState.instances).toHaveLength(1);
    expect(guiMockState.instances[0]?.options.title).toBe("Staggered Text Timing");

    act(() => {
      root.unmount();
    });

    expect(guiMockState.destroyed).toBe(1);
  });

  it("does not create the lil-gui panel in production", async () => {
    process.env.NODE_ENV = "production";

    await act(async () => {
      root.render(<TestHarness />);
    });
    await vi.dynamicImportSettled();

    expect(guiMockState.instances).toHaveLength(0);
  });

  it("updates the live timing state when a control changes", async () => {
    await act(async () => {
      root.render(<TestHarness />);
    });
    await vi.dynamicImportSettled();
    await act(async () => {
      await Promise.resolve();
    });

    const outgoingStaggerController = guiMockState.controllers.get("outgoingStaggerStepMs");

    expect(outgoingStaggerController).toBeDefined();

    await act(async () => {
      outgoingStaggerController?.setValue(26);
    });

    expect(container.querySelector('[data-testid="tuning-values"]')?.getAttribute("data-outgoing-stagger-step")).toBe("26");
  });

  it("updates the live typography state when typography controls change", async () => {
    await act(async () => {
      root.render(<TestHarness />);
    });
    await vi.dynamicImportSettled();
    await act(async () => {
      await Promise.resolve();
    });

    const letterSpacingController = guiMockState.controllers.get("letterSpacingEm");
    const fontWeightController = guiMockState.controllers.get("fontWeight");

    expect(letterSpacingController).toBeDefined();
    expect(fontWeightController).toBeDefined();

    await act(async () => {
      letterSpacingController?.setValue(-0.018);
      fontWeightController?.setValue(760);
    });

    const tuningValues = container.querySelector('[data-testid="tuning-values"]');

    expect(tuningValues?.getAttribute("data-letter-spacing")).toBe("-0.018");
    expect(tuningValues?.getAttribute("data-font-weight")).toBe("760");
  });
});
