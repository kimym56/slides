// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { BwCirclePlaybackState } from "./BwCircleProject";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const sceneRenderSpy = vi.fn();
const panelRenderSpy = vi.fn();
let latestSceneProps: {
  onEstimatedBpmChange?: (estimatedBpm: number | null) => void;
} | null = null;
let latestPanelProps: {
  estimatedBpm?: number | null;
  onLoad: (videoId: string | null) => void;
  onPlaybackChange: (playback: BwCirclePlaybackState) => void;
} | null = null;

vi.mock("framer-motion", () => ({
  useReducedMotion: () => false,
}));

vi.mock("./BwCircleScene", () => ({
  default: ({
    mode,
    onEstimatedBpmChange,
    syncOverlay,
  }: {
    mode: "mimesis" | "sync";
    onEstimatedBpmChange?: (estimatedBpm: number | null) => void;
    syncOverlay?: React.ReactNode;
  }) => {
    latestSceneProps = { onEstimatedBpmChange };
    sceneRenderSpy(mode);

    return (
      <div data-scene-mode={mode}>
        <div>mock-scene</div>
        {syncOverlay}
      </div>
    );
  },
}));

vi.mock("./BwCircleYouTubePanel", () => ({
  default: ({
    estimatedBpm,
    onLoad,
    onPlaybackChange,
  }: {
    estimatedBpm?: number | null;
    onLoad: (videoId: string | null) => void;
    onPlaybackChange: (playback: BwCirclePlaybackState) => void;
  }) => {
    latestPanelProps = { estimatedBpm, onLoad, onPlaybackChange };
    panelRenderSpy();

    return (
      <div>{estimatedBpm === null ? "-- BPM" : `${estimatedBpm} BPM`}</div>
    );
  },
}));

import BwCircleProject from "./BwCircleProject";

describe("BwCircleProject playback updates", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    sceneRenderSpy.mockClear();
    panelRenderSpy.mockClear();
    latestSceneProps = null;
    latestPanelProps = null;
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

  it("does not rerender the scene for each playback sample while sync is running", () => {
    act(() => {
      root.render(<BwCircleProject projectId="black-white-circle" />);
    });

    const syncButton = container.querySelector(
      '[data-mode="sync"]',
    ) as HTMLButtonElement | null;

    act(() => {
      syncButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    const sceneRenderCountAfterModeSwitch = sceneRenderSpy.mock.calls.length;

    expect(latestPanelProps).not.toBeNull();

    act(() => {
      latestPanelProps?.onPlaybackChange({
        currentTime: 12,
        isPlaying: true,
        sampledAtMs: 1_000,
      });
    });

    act(() => {
      latestPanelProps?.onPlaybackChange({
        currentTime: 12.18,
        isPlaying: true,
        sampledAtMs: 1_180,
      });
    });

    act(() => {
      latestPanelProps?.onPlaybackChange({
        currentTime: 12.36,
        isPlaying: true,
        sampledAtMs: 1_360,
      });
    });

    expect(sceneRenderSpy).toHaveBeenCalledTimes(
      sceneRenderCountAfterModeSwitch,
    );
  });

  it("passes scene-published estimated BPM into the sync panel", () => {
    act(() => {
      root.render(<BwCircleProject projectId="black-white-circle" />);
    });

    const syncButton = container.querySelector(
      '[data-mode="sync"]',
    ) as HTMLButtonElement | null;

    act(() => {
      syncButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(latestSceneProps?.onEstimatedBpmChange).toBeTypeOf("function");

    act(() => {
      latestSceneProps?.onEstimatedBpmChange?.(128);
    });

    expect(latestPanelProps?.estimatedBpm).toBe(128);
    expect(container.textContent).toContain("128 BPM");
  });

  it("renders the permission copy beside the sync toggle instead of inside the panel", () => {
    act(() => {
      root.render(<BwCircleProject projectId="black-white-circle" />);
    });

    const syncButton = container.querySelector(
      '[data-mode="sync"]',
    ) as HTMLButtonElement | null;
    const modeRow = container.querySelector('[data-sync-mode-row="true"]');

    expect(syncButton).not.toBeNull();
    expect(modeRow?.textContent).not.toContain(
      "*Allow permission to use audio sync for this feature.",
    );

    act(() => {
      syncButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(modeRow?.textContent).toContain(
      "*Allow permission to use audio sync for this feature.",
    );
  });
});
