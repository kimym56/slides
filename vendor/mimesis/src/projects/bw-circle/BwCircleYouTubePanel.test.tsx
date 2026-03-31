// @vitest-environment jsdom

import { act, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import BwCircleYouTubePanel from "./BwCircleYouTubePanel";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

interface MockPlayerInstance {
  cueVideoById: (videoId: string) => void;
  destroy: () => void;
  getCurrentTime: () => number;
  getPlayerState: () => number;
  loadVideoById: (videoId: string) => void;
  playVideo: () => void;
  stopVideo: () => void;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          events?: {
            onError?: (event: {
              data: number;
              target: MockPlayerInstance;
            }) => void;
            onReady?: (event: { target: MockPlayerInstance }) => void;
            onStateChange?: (event: {
              data: number;
              target: MockPlayerInstance;
            }) => void;
          };
          videoId?: string;
        },
      ) => Partial<MockPlayerInstance>;
    };
  }
}

describe("BwCircleYouTubePanel", () => {
  let container: HTMLDivElement;
  let originalMediaDevices: MediaDevices | undefined;
  let originalMediaStream: typeof MediaStream | undefined;
  let getDisplayMediaMock: ReturnType<typeof vi.fn>;
  let root: Root;

  function createMockPlayer(playerState = 1) {
    return {
      cueVideoById: vi.fn(),
      destroy: vi.fn(),
      getCurrentTime: vi.fn(() => 42),
      getPlayerState: vi.fn(() => playerState),
      loadVideoById: vi.fn(),
      playVideo: vi.fn(),
      stopVideo: vi.fn(),
    } satisfies MockPlayerInstance;
  }

  function createMockStream({
    audioTracks = [],
    videoTracks = [],
  }: {
    audioTracks?: MediaStreamTrack[];
    videoTracks?: MediaStreamTrack[];
  } = {}) {
    const tracks = [...audioTracks, ...videoTracks];

    return {
      getAudioTracks: vi.fn(() => audioTracks),
      getTracks: vi.fn(() => tracks),
      getVideoTracks: vi.fn(() => videoTracks),
    } as unknown as MediaStream;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    originalMediaDevices = navigator.mediaDevices;
    originalMediaStream = globalThis.MediaStream;
    getDisplayMediaMock = vi.fn(async () => createMockStream());
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: {
        getDisplayMedia: getDisplayMediaMock,
      },
    });
    Object.defineProperty(globalThis, "MediaStream", {
      configurable: true,
      value: vi.fn(function MockMediaStream(tracks?: MediaStreamTrack[]) {
        return createMockStream({
          audioTracks: tracks ?? [],
        });
      }),
    });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    delete window.YT;
    delete window.onYouTubeIframeAPIReady;
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: originalMediaDevices,
    });
    Object.defineProperty(globalThis, "MediaStream", {
      configurable: true,
      value: originalMediaStream,
    });
    vi.useRealTimers();
  });

  it("shows a placeholder BPM badge until an estimate is available", async () => {
    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          estimatedBpm={null}
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId={null}
        />,
      );
    });

    expect(container.textContent).toContain("-- BPM");
  });

  it("shows the estimated BPM beside the input row when available", async () => {
    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          estimatedBpm={128}
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId={null}
        />,
      );
    });

    expect(container.textContent).toContain("128 BPM");
  });

  it("renders the sync row as link then play then bpm", async () => {
    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          estimatedBpm={128}
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId={null}
        />,
      );
    });

    const input = container.querySelector("input");

    expect(input).not.toBeNull();

    const rowChildren = Array.from(input?.parentElement?.children ?? []);

    expect(rowChildren).toHaveLength(3);
    expect(rowChildren[0]).toBe(input);
    expect(rowChildren[1]?.textContent?.trim()).toBe("Play");
    expect(rowChildren[2]?.textContent).toContain("128 BPM");
  });

  it("updates the bpm label tone when the sampled canvas background changes", async () => {
    let sampledPixel = Uint8ClampedArray.from([0, 0, 0, 255]);
    const originalGetContext = HTMLCanvasElement.prototype.getContext;

    HTMLCanvasElement.prototype.getContext = vi.fn(
      () =>
        ({
          getImageData: vi.fn(() => ({
            data: sampledPixel,
          })),
        }) as unknown as CanvasRenderingContext2D,
    );

    try {
      await act(async () => {
        root.render(
          <div data-scene-mode="sync">
            <BwCircleYouTubePanel
              estimatedBpm={128}
              onLoad={vi.fn()}
              onPlaybackChange={vi.fn()}
              videoId={null}
            />
            <canvas />
          </div>,
        );
      });

      const badge = container.querySelector('[aria-live="polite"]');
      const canvas = container.querySelector("canvas");

      expect(badge).not.toBeNull();
      expect(canvas).not.toBeNull();

      if (badge instanceof HTMLSpanElement) {
        badge.getBoundingClientRect = () =>
          ({
            bottom: 34,
            height: 20,
            left: 120,
            right: 184,
            top: 14,
            width: 64,
            x: 120,
            y: 14,
            toJSON: () => ({}),
          }) as DOMRect;
      }

      if (canvas instanceof HTMLCanvasElement) {
        canvas.width = 240;
        canvas.height = 120;
        canvas.getBoundingClientRect = () =>
          ({
            bottom: 120,
            height: 120,
            left: 0,
            right: 240,
            top: 0,
            width: 240,
            x: 0,
            y: 0,
            toJSON: () => ({}),
          }) as DOMRect;
      }

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(badge?.getAttribute("data-contrast-tone")).toBe("light");

      sampledPixel = Uint8ClampedArray.from([255, 255, 255, 255]);

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(badge?.getAttribute("data-contrast-tone")).toBe("dark");
    } finally {
      HTMLCanvasElement.prototype.getContext = originalGetContext;
    }
  });

  it("does not render the permission message inside the sync panel", async () => {
    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          audioSyncStatus="idle"
          onAudioSyncChange={vi.fn()}
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId={null}
        />,
      );
    });

    expect(container.textContent).not.toContain(
      "*Allow permission to use audio sync for this feature.",
    );
  });

  it("uses the ready event target when the constructor return value is not yet queryable", async () => {
    const onPlaybackChange = vi.fn();
    const readyPlayer = createMockPlayer();

    const MockPlayer = vi.fn(function MockPlayer(
      _element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      window.setTimeout(() => {
        options.events?.onReady?.({ target: readyPlayer });
      }, 0);

      return {
        destroy: vi.fn(),
      };
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          onLoad={vi.fn()}
          onPlaybackChange={onPlaybackChange}
          videoId="abc123XYZ09"
        />,
      );
      await Promise.resolve();
    });

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(1);
      });
    }).not.toThrow();

    expect(onPlaybackChange).toHaveBeenLastCalledWith({
      currentTime: 42,
      isPlaying: true,
      sampledAtMs: expect.any(Number),
    });
  });

  it("does not render a youtube preview host before a video is loaded", async () => {
    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId={null}
        />,
      );
    });

    expect(
      container.querySelector('[data-youtube-player-host="true"]'),
    ).toBeNull();
  });

  it("renders the youtube preview host once a video is loaded", async () => {
    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId="97qr0BOdHkc"
        />,
      );
    });

    expect(
      container.querySelector('[data-youtube-player-host="true"]'),
    ).not.toBeNull();
  });

  it("commits a valid url on Enter without showing a load action", async () => {
    const onLoad = vi.fn();

    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          onLoad={onLoad}
          onPlaybackChange={vi.fn()}
          videoId={null}
        />,
      );
    });

    const input = container.querySelector("input");

    expect(input).not.toBeNull();

    act(() => {
      input?.dispatchEvent(new Event("focus", { bubbles: true }));
      input?.dispatchEvent(new InputEvent("input", { bubbles: true }));
    });

    act(() => {
      if (input instanceof HTMLInputElement) {
        input.value = "https://youtu.be/97qr0BOdHkc?si=xgT_cD0WHCGQsn_C";
      }
      input?.dispatchEvent(new Event("input", { bubbles: true }));
      input?.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Enter" }),
      );
    });

    expect(onLoad).toHaveBeenCalledWith("97qr0BOdHkc");
    expect(container.textContent).not.toContain("Load");
  });

  it("plays and stops the preview player from the single control button", async () => {
    const onPlaybackChange = vi.fn();
    const readyPlayer = createMockPlayer(2);
    let onStateChange:
      | ((event: { data: number; target: MockPlayerInstance }) => void)
      | undefined;

    const MockPlayer = vi.fn(function MockPlayer(
      _element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      onStateChange = options.events?.onStateChange;

      window.setTimeout(() => {
        options.events?.onReady?.({ target: readyPlayer });
      }, 0);

      return readyPlayer;
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          onLoad={vi.fn()}
          onPlaybackChange={onPlaybackChange}
          videoId="97qr0BOdHkc"
        />,
      );
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const button = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent?.trim() === "Play",
    );

    expect(button).not.toBeUndefined();

    act(() => {
      button?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(readyPlayer.playVideo).toHaveBeenCalledTimes(1);

    act(() => {
      onStateChange?.({ data: 1, target: readyPlayer });
    });

    expect(container.textContent).toContain("Stop");

    const stopButton = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent?.trim() === "Stop",
    );

    act(() => {
      stopButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(readyPlayer.stopVideo).toHaveBeenCalledTimes(1);
  });

  it("creates the youtube preview player with a valid minimum viewport", async () => {
    const readyPlayer = createMockPlayer(2);

    const MockPlayer = vi.fn(function MockPlayer(
      _element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      window.setTimeout(() => {
        options.events?.onReady?.({ target: readyPlayer });
      }, 0);

      return readyPlayer;
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId="97qr0BOdHkc"
        />,
      );
      await Promise.resolve();
    });

    expect(MockPlayer).toHaveBeenCalledWith(
      expect.any(HTMLDivElement),
      expect.objectContaining({
        height: "200",
        playerVars: expect.objectContaining({
          origin: window.location.origin,
        }),
        width: "200",
      }),
    );
  });

  it("does not cue a placeholder video before the user commits a link", async () => {
    const readyPlayer = createMockPlayer(2);

    const MockPlayer = vi.fn(function MockPlayer(
      _element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      window.setTimeout(() => {
        options.events?.onReady?.({ target: readyPlayer });
      }, 0);

      return readyPlayer;
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId={null}
        />,
      );
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(readyPlayer.cueVideoById).not.toHaveBeenCalled();
  });

  it("does not create a youtube player before the user commits a link", async () => {
    const readyPlayer = createMockPlayer(2);

    const MockPlayer = vi.fn(function MockPlayer(
      _element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      window.setTimeout(() => {
        options.events?.onReady?.({ target: readyPlayer });
      }, 0);

      return readyPlayer;
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId={null}
        />,
      );
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(MockPlayer).not.toHaveBeenCalled();
  });

  it("loads and plays the placeholder video when Play is pressed before any link is entered", async () => {
    const firstPlayer = createMockPlayer(2);

    const MockPlayer = vi.fn(function MockPlayer(
      _element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      window.setTimeout(() => {
        options.events?.onReady?.({ target: firstPlayer });
      }, 0);

      return firstPlayer;
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    function Harness() {
      const [videoId, setVideoId] = useState<string | null>(null);

      return (
        <BwCircleYouTubePanel
          onLoad={setVideoId}
          onPlaybackChange={vi.fn()}
          videoId={videoId}
        />
      );
    }

    await act(async () => {
      root.render(<Harness />);
      await Promise.resolve();
    });

    const playButton = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent?.trim() === "Play",
    );

    act(() => {
      playButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(MockPlayer).toHaveBeenCalledTimes(1);
    expect(firstPlayer.loadVideoById).toHaveBeenCalledWith("97qr0BOdHkc");
  });

  it("requests current-tab audio capture when Play is pressed", async () => {
    const readyPlayer = createMockPlayer(2);

    const MockPlayer = vi.fn(function MockPlayer(
      _element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      window.setTimeout(() => {
        options.events?.onReady?.({ target: readyPlayer });
      }, 0);

      return readyPlayer;
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          audioSyncStatus="idle"
          onAudioSyncChange={vi.fn()}
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId="97qr0BOdHkc"
        />,
      );
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const playButton = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent?.trim() === "Play",
    );

    act(() => {
      playButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(getDisplayMediaMock).toHaveBeenCalledWith({
      audio: true,
      preferCurrentTab: true,
      selfBrowserSurface: "include",
      surfaceSwitching: "include",
      video: true,
    });
  });

  it("reports an active audio-sync stream after capture permission succeeds", async () => {
    const onAudioSyncChange = vi.fn();
    const readyPlayer = createMockPlayer(2);
    const audioTrack = {
      kind: "audio",
      stop: vi.fn(),
    } as unknown as MediaStreamTrack;
    const videoTrack = {
      kind: "video",
      stop: vi.fn(),
    } as unknown as MediaStreamTrack;
    const stream = createMockStream({
      audioTracks: [audioTrack],
      videoTracks: [videoTrack],
    });

    getDisplayMediaMock.mockResolvedValueOnce(stream);

    const MockPlayer = vi.fn(function MockPlayer(
      _element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      window.setTimeout(() => {
        options.events?.onReady?.({ target: readyPlayer });
      }, 0);

      return readyPlayer;
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          audioSyncStatus="idle"
          onAudioSyncChange={onAudioSyncChange}
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId="97qr0BOdHkc"
        />,
      );
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const playButton = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent?.trim() === "Play",
    );

    await act(async () => {
      playButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(videoTrack.stop).toHaveBeenCalledTimes(1);

    const latestAudioSync = onAudioSyncChange.mock.calls.at(-1)?.[0];

    expect(latestAudioSync).toMatchObject({
      status: "active",
    });
    expect(latestAudioSync?.stream).not.toBe(stream);
    expect(latestAudioSync?.stream?.getAudioTracks()).toEqual([audioTrack]);
    expect(latestAudioSync?.stream?.getVideoTracks()).toEqual([]);
  });

  it("keeps the permission message out of the panel when audio capture is denied", async () => {
    const readyPlayer = createMockPlayer(2);

    getDisplayMediaMock.mockRejectedValueOnce(
      new DOMException("Denied", "NotAllowedError"),
    );

    const MockPlayer = vi.fn(function MockPlayer(
      _element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      window.setTimeout(() => {
        options.events?.onReady?.({ target: readyPlayer });
      }, 0);

      return readyPlayer;
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    await act(async () => {
      root.render(
        <BwCircleYouTubePanel
          audioSyncStatus="idle"
          onAudioSyncChange={vi.fn()}
          onLoad={vi.fn()}
          onPlaybackChange={vi.fn()}
          videoId="97qr0BOdHkc"
        />,
      );
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const playButton = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent?.trim() === "Play",
    );

    await act(async () => {
      playButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await Promise.resolve();
    });

    expect(container.textContent).not.toContain(
      "*Allow permission to use audio sync for this feature.",
    );
  });

  it("loads and plays a newly entered link once the lazily created player becomes ready", async () => {
    const firstPlayer = createMockPlayer(2);

    const MockPlayer = vi.fn(function MockPlayer(
      _element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      window.setTimeout(() => {
        options.events?.onReady?.({ target: firstPlayer });
      }, 0);

      return firstPlayer;
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    function Harness() {
      const [videoId, setVideoId] = useState<string | null>(null);

      return (
        <BwCircleYouTubePanel
          onLoad={setVideoId}
          onPlaybackChange={vi.fn()}
          videoId={videoId}
        />
      );
    }

    await act(async () => {
      root.render(<Harness />);
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    const input = container.querySelector("input");
    const playButton = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent?.trim() === "Play",
    );

    act(() => {
      if (input instanceof HTMLInputElement) {
        input.value = "https://youtu.be/97qr0BOdHkc?si=xgT_cD0WHCGQsn_C";
      }
      input?.dispatchEvent(new Event("input", { bubbles: true }));
      playButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1);
    });

    expect(MockPlayer).toHaveBeenCalledTimes(1);
    expect(firstPlayer.loadVideoById).toHaveBeenCalledWith("97qr0BOdHkc");
  });

  it("surfaces a helpful message when YouTube reports that a video is unavailable", async () => {
    const firstPlayer = createMockPlayer(2);
    let onError:
      | ((event: { data: number; target: MockPlayerInstance }) => void)
      | undefined;

    const MockPlayer = vi.fn(function MockPlayer(
      _element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      onError = options.events?.onError;

      window.setTimeout(() => {
        options.events?.onReady?.({ target: firstPlayer });
      }, 0);

      return firstPlayer;
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    function Harness() {
      const [videoId, setVideoId] = useState<string | null>(null);

      return (
        <BwCircleYouTubePanel
          onLoad={setVideoId}
          onPlaybackChange={vi.fn()}
          videoId={videoId}
        />
      );
    }

    await act(async () => {
      root.render(<Harness />);
      await Promise.resolve();
    });

    const input = container.querySelector("input");
    const playButton = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent?.trim() === "Play",
    );

    act(() => {
      if (input instanceof HTMLInputElement) {
        input.value = "https://youtu.be/abc123XYZ09?t=30";
      }
      input?.dispatchEvent(new Event("input", { bubbles: true }));
      playButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await act(async () => {
      await Promise.resolve();
    });

    act(() => {
      vi.advanceTimersByTime(1);
      onError?.({ data: 100, target: firstPlayer });
    });

    expect(container.textContent).toContain("This video is unavailable.");
  });

  it("does not crash when YouTube replaces its mount node before an error rerender", async () => {
    const player = createMockPlayer(2);
    let onError:
      | ((event: { data: number; target: MockPlayerInstance }) => void)
      | undefined;

    const MockPlayer = vi.fn(function MockPlayer(
      element: HTMLElement,
      options: {
        events?: {
          onError?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
          onReady?: (event: { target: MockPlayerInstance }) => void;
          onStateChange?: (event: {
            data: number;
            target: MockPlayerInstance;
          }) => void;
        };
        videoId?: string;
      },
    ) {
      onError = options.events?.onError;

      const iframe = document.createElement("iframe");
      element.replaceWith(iframe);

      window.setTimeout(() => {
        options.events?.onReady?.({ target: player });
      }, 0);

      return player;
    });

    window.YT = {
      Player: MockPlayer as unknown as Window["YT"]["Player"],
    };

    function Harness() {
      const [videoId, setVideoId] = useState<string | null>(null);

      return (
        <BwCircleYouTubePanel
          onLoad={setVideoId}
          onPlaybackChange={vi.fn()}
          videoId={videoId}
        />
      );
    }

    await act(async () => {
      root.render(<Harness />);
      await Promise.resolve();
    });

    const input = container.querySelector("input");
    const playButton = [...container.querySelectorAll("button")].find(
      (candidate) => candidate.textContent?.trim() === "Play",
    );

    act(() => {
      if (input instanceof HTMLInputElement) {
        input.value = "https://youtu.be/abc123XYZ09?t=30";
      }
      input?.dispatchEvent(new Event("input", { bubbles: true }));
      playButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(() => {
      act(() => {
        vi.advanceTimersByTime(1);
        onError?.({ data: 100, target: player });
      });
    }).not.toThrow();

    expect(container.textContent).toContain("This video is unavailable.");
  });
});
