import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createRealtimeBpmAnalyzer,
} from "./bwCircleRealtimeBpmVendor";
import { createBwCircleRealtimeBpmBridge } from "./bwCircleRealtimeBpm";

vi.mock("./bwCircleRealtimeBpmVendor", () => ({
  createRealtimeBpmAnalyzer: vi.fn(),
  getBiquadFilter: vi.fn(),
}));

class MockRealtimeBpmAnalyzer extends EventTarget {
  addEventListenerSpy = vi.fn();
  connect = vi.fn();
  disconnect = vi.fn();
  node = { kind: "bpm-node" } as unknown as AudioNode;
  removeEventListenerSpy = vi.fn();
  stop = vi.fn();

  override addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | AddEventListenerOptions,
  ) {
    this.addEventListenerSpy(type, listener, options);
    super.addEventListener(type, listener, options);
  }

  override removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject | null,
    options?: boolean | EventListenerOptions,
  ) {
    this.removeEventListenerSpy(type, listener, options);
    super.removeEventListener(type, listener, options);
  }
}

describe("createBwCircleRealtimeBpmBridge", () => {
  let analyzer: MockRealtimeBpmAnalyzer;
  let audioContext: AudioContext;
  let mutedSinkNode: GainNode;
  let signalGainNode: GainNode;
  let onBpm: ReturnType<typeof vi.fn>;
  let sourceNode: AudioNode;

  beforeEach(() => {
    signalGainNode = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: {
        value: 1,
      },
    } as unknown as GainNode;
    analyzer = new MockRealtimeBpmAnalyzer();
    mutedSinkNode = {
      connect: vi.fn(),
      disconnect: vi.fn(),
      gain: {
        value: 1,
      },
    } as unknown as GainNode;
    audioContext = {
      createGain: vi
        .fn()
        .mockReturnValueOnce(signalGainNode)
        .mockReturnValueOnce(mutedSinkNode),
      destination: { kind: "destination" } as AudioNode,
    } as unknown as AudioContext;
    onBpm = vi.fn();
    sourceNode = {
      connect: vi.fn(),
      disconnect: vi.fn(),
    } as unknown as AudioNode;

    vi.mocked(createRealtimeBpmAnalyzer).mockResolvedValue(
      analyzer as unknown as Awaited<ReturnType<typeof createRealtimeBpmAnalyzer>>,
    );
  });

  it("connects the source directly into the realtime analyzer without a low-pass filter", async () => {
    const bridge = await createBwCircleRealtimeBpmBridge({
      audioContext,
      onBpm,
      sourceNode,
    });

    expect(createRealtimeBpmAnalyzer).toHaveBeenCalledWith(audioContext, {
      continuousAnalysis: true,
      debug: false,
      stabilizationTime: 8_000,
    });
    expect(audioContext.createGain).toHaveBeenCalledTimes(2);
    expect(signalGainNode.gain.value).toBe(6);
    expect(mutedSinkNode.gain.value).toBe(0);
    expect(sourceNode.connect).toHaveBeenCalledWith(signalGainNode);
    expect(signalGainNode.connect).toHaveBeenCalledWith(analyzer.node);
    expect(analyzer.connect).toHaveBeenCalledWith(mutedSinkNode);
    expect(mutedSinkNode.connect).toHaveBeenCalledWith(audioContext.destination);
    expect(
      analyzer.addEventListenerSpy.mock.calls.map(([eventType]) => eventType),
    ).toEqual(["bpm", "bpmStable"]);

    bridge.disconnect();

    expect(sourceNode.disconnect).toHaveBeenCalledWith(signalGainNode);
    expect(signalGainNode.disconnect).toHaveBeenCalledTimes(1);
    expect(mutedSinkNode.disconnect).toHaveBeenCalledTimes(1);
    expect(analyzer.stop).toHaveBeenCalledTimes(1);
    expect(analyzer.disconnect).toHaveBeenCalledTimes(1);
    expect(
      analyzer.removeEventListenerSpy.mock.calls.map(([eventType]) => eventType),
    ).toEqual(["bpm", "bpmStable"]);
  });

  it("publishes rounded BPM updates from analyzer events and stops after disconnect", async () => {
    const bridge = await createBwCircleRealtimeBpmBridge({
      audioContext,
      onBpm,
      sourceNode,
    });

    analyzer.dispatchEvent(
      new CustomEvent("bpmStable", {
        detail: {
          bpm: [
            { confidence: 0.9, count: 42, tempo: 127.6 },
          ],
          threshold: 0.4,
        },
      }),
    );
    analyzer.dispatchEvent(
      new CustomEvent("bpm", {
        detail: {
          bpm: [
            { confidence: 0.85, count: 30, tempo: 126.2 },
          ],
          threshold: 0.35,
        },
      }),
    );
    analyzer.dispatchEvent(
      new CustomEvent("bpm", {
        detail: {
          bpm: [],
          threshold: 0.2,
        },
      }),
    );

    expect(onBpm).toHaveBeenNthCalledWith(1, 128);
    expect(onBpm).toHaveBeenNthCalledWith(2, 126);
    expect(onBpm).toHaveBeenCalledTimes(2);

    bridge.disconnect();

    analyzer.dispatchEvent(
      new CustomEvent("bpmStable", {
        detail: {
          bpm: [
            { confidence: 0.95, count: 50, tempo: 129.2 },
          ],
          threshold: 0.45,
        },
      }),
    );

    expect(onBpm).toHaveBeenCalledTimes(2);
  });

  it("does not require a diagnostic callback to publish bpm events", async () => {
    await createBwCircleRealtimeBpmBridge({
      audioContext,
      onBpm,
      sourceNode,
    });

    analyzer.dispatchEvent(
      new CustomEvent("bpm", {
        detail: {
          bpm: [
            { confidence: 0.7, count: 12, tempo: 92.4 },
          ],
          threshold: 0.35,
        },
      }),
    );

    expect(onBpm).toHaveBeenCalledWith(92);
  });
});
