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
import type { BwCircleRealtimeBpmBridgeInput } from "./bwCircleRealtimeBpm";
import BwCircleScene from "./BwCircleScene";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { createBwCircleRealtimeBpmBridgeMock } = vi.hoisted(() => ({
  createBwCircleRealtimeBpmBridgeMock: vi.fn(),
}));

vi.mock("framer-motion", () => ({
  useReducedMotion: () => false,
}));

vi.mock("./bwCircleRealtimeBpm", () => ({
  createBwCircleRealtimeBpmBridge: createBwCircleRealtimeBpmBridgeMock,
}));

describe("BwCircleScene audio sync", () => {
  let analyser: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
    fftSize: number;
    frequencyBinCount: number;
    getByteFrequencyData: ReturnType<typeof vi.fn>;
    smoothingTimeConstant: number;
  };
  let audioContextInstances: MockAudioContext[];
  let canvasContext: {
    arc: ReturnType<typeof vi.fn>;
    beginPath: ReturnType<typeof vi.fn>;
    clearRect: ReturnType<typeof vi.fn>;
    clip: ReturnType<typeof vi.fn>;
    fill: ReturnType<typeof vi.fn>;
    fillRect: ReturnType<typeof vi.fn>;
    moveTo: ReturnType<typeof vi.fn>;
    restore: ReturnType<typeof vi.fn>;
    rotate: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    scale: ReturnType<typeof vi.fn>;
    setTransform: ReturnType<typeof vi.fn>;
    stroke: ReturnType<typeof vi.fn>;
    translate: ReturnType<typeof vi.fn>;
  };
  let container: HTMLDivElement;
  let mediaSource: {
    connect: ReturnType<typeof vi.fn>;
    disconnect: ReturnType<typeof vi.fn>;
  };
  let originalAudioContext: typeof window.AudioContext | undefined;
  let originalCancelAnimationFrame: typeof window.cancelAnimationFrame;
  let originalDevicePixelRatio: number | undefined;
  let originalGetContext: typeof HTMLCanvasElement.prototype.getContext;
  let originalRequestAnimationFrame: typeof window.requestAnimationFrame;
  let performanceNowSpy: ReturnType<typeof vi.spyOn> | null;
  let consoleInfoSpy: ReturnType<typeof vi.spyOn> | null;
  let rafCallback: FrameRequestCallback | null;
  let root: Root;

  class MockAudioContext {
    createAnalyser = vi.fn(() => analyser);
    createMediaStreamSource = vi.fn(() => mediaSource);
    resume = vi.fn(async () => undefined);
    close = vi.fn(async () => undefined);
  }

  beforeAll(() => {
    originalAudioContext = window.AudioContext;
    originalGetContext = HTMLCanvasElement.prototype.getContext;
    originalRequestAnimationFrame = window.requestAnimationFrame;
    originalCancelAnimationFrame = window.cancelAnimationFrame;
    originalDevicePixelRatio = window.devicePixelRatio;

    canvasContext = {
      arc: vi.fn(),
      beginPath: vi.fn(),
      clearRect: vi.fn(),
      clip: vi.fn(),
      fill: vi.fn(),
      fillRect: vi.fn(),
      moveTo: vi.fn(),
      restore: vi.fn(),
      rotate: vi.fn(),
      save: vi.fn(),
      scale: vi.fn(),
      setTransform: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
    };

    HTMLCanvasElement.prototype.getContext = vi.fn(
      () => canvasContext as unknown as CanvasRenderingContext2D,
    );
    window.requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      rafCallback = callback;
      return 1;
    });
    window.cancelAnimationFrame = vi.fn();
  });

  beforeEach(() => {
    performanceNowSpy = null;
    consoleInfoSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    rafCallback = null;
    canvasContext.setTransform.mockClear();
    analyser = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      fftSize: 0,
      frequencyBinCount: 32,
      getByteFrequencyData: vi.fn((data: Uint8Array) => {
        data.fill(64);
      }),
      smoothingTimeConstant: 0,
    };
    mediaSource = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    audioContextInstances = [];
    createBwCircleRealtimeBpmBridgeMock.mockReset();
    createBwCircleRealtimeBpmBridgeMock.mockResolvedValue({
      disconnect: vi.fn(),
    });
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: vi.fn(function MockWindowAudioContext() {
        const context = new MockAudioContext();
        audioContextInstances.push(context);
        return context;
      }),
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterAll(() => {
    HTMLCanvasElement.prototype.getContext = originalGetContext;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    Object.defineProperty(window, "AudioContext", {
      configurable: true,
      value: originalAudioContext,
    });
    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: originalDevicePixelRatio,
    });
  });

  afterEach(() => {
    performanceNowSpy?.mockRestore();
    consoleInfoSpy?.mockRestore();
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("creates an analyser graph when sync mode receives an active capture stream", () => {
    const stream = {
      getTracks: () => [],
    } as unknown as MediaStream;
    const onEstimatedBpmChange = vi.fn();

    act(() => {
      root.render(
        <BwCircleScene
          audioSync={{
            status: "active",
            stream,
          }}
          bpm={120}
          mode="sync"
          onEstimatedBpmChange={onEstimatedBpmChange}
          playbackRef={{
            current: {
              currentTime: 4,
              isPlaying: true,
              sampledAtMs: 1_000,
            },
          }}
        />,
      );
    });

    expect(audioContextInstances).toHaveLength(1);
    expect(
      audioContextInstances[0]?.createMediaStreamSource,
    ).toHaveBeenCalledWith(stream);
    expect(audioContextInstances[0]?.createAnalyser).toHaveBeenCalledTimes(1);
    expect(mediaSource.connect).toHaveBeenCalledWith(analyser);
    expect(createBwCircleRealtimeBpmBridgeMock).toHaveBeenCalledTimes(1);
    expect(createBwCircleRealtimeBpmBridgeMock).toHaveBeenCalledWith({
      audioContext: audioContextInstances[0],
      onBpm: expect.any(Function),
      sourceNode: mediaSource,
    });

    const firstCallInput =
      createBwCircleRealtimeBpmBridgeMock.mock.calls[0]?.[0] as
        | BwCircleRealtimeBpmBridgeInput
        | undefined;

    expect(firstCallInput).toBeDefined();

    act(() => {
      firstCallInput?.onBpm(128);
    });

    expect(onEstimatedBpmChange).toHaveBeenCalledWith(128);
    expect(consoleInfoSpy).not.toHaveBeenCalled();
  });

  it("disconnects the previous analyser graph when audio sync becomes inactive", () => {
    const stream = {
      getTracks: () => [],
    } as unknown as MediaStream;

    act(() => {
      root.render(
        <BwCircleScene
          audioSync={{
            status: "active",
            stream,
          }}
          bpm={120}
          mode="sync"
          playbackRef={{
            current: {
              currentTime: 4,
              isPlaying: true,
              sampledAtMs: 1_000,
            },
          }}
        />,
      );
    });

    act(() => {
      root.render(
        <BwCircleScene
          audioSync={{
            status: "idle",
            stream: null,
          }}
          bpm={120}
          mode="sync"
          playbackRef={{
            current: {
              currentTime: 4,
              isPlaying: false,
              sampledAtMs: 1_000,
            },
          }}
        />,
      );
    });

    expect(mediaSource.disconnect).toHaveBeenCalledTimes(1);
    expect(analyser.disconnect).toHaveBeenCalledTimes(1);
  });

  it("does not crash during sync frames before tempo state exists", () => {
    const stream = {
      getTracks: () => [],
    } as unknown as MediaStream;

    performanceNowSpy = vi.spyOn(performance, "now").mockReturnValue(1_500);

    act(() => {
      root.render(
        <BwCircleScene
          audioSync={{
            status: "active",
            stream,
          }}
          bpm={120}
          mode="sync"
          playbackRef={{
            current: {
              currentTime: 4,
              isPlaying: false,
              sampledAtMs: 1_000,
            },
          }}
        />,
      );
    });

    expect(rafCallback).toBeTypeOf("function");

    expect(() => {
      act(() => {
        rafCallback?.(1_500);
      });
    }).not.toThrow();
  });

  it("caps the canvas pixel ratio during active sync capture", () => {
    const stream = {
      getTracks: () => [],
    } as unknown as MediaStream;

    Object.defineProperty(window, "devicePixelRatio", {
      configurable: true,
      value: 2,
    });

    act(() => {
      root.render(
        <BwCircleScene
          audioSync={{
            status: "active",
            stream,
          }}
          bpm={120}
          mode="sync"
          playbackRef={{
            current: {
              currentTime: 4,
              isPlaying: true,
              sampledAtMs: 1_000,
            },
          }}
        />,
      );
    });

    expect(canvasContext.setTransform).toHaveBeenCalledWith(1, 0, 0, 1, 0, 0);
  });
});
