import {
  createRealtimeBpmAnalyzer,
} from "./bwCircleRealtimeBpmVendor";

interface BwCircleTempoCandidate {
  confidence?: number;
  count?: number;
  tempo: number;
}

export interface BwCircleTempoCandidates {
  bpm: readonly BwCircleTempoCandidate[];
  threshold?: number;
}

interface BwCircleRealtimeBpmAnalyzerLike extends EventTarget {
  connect: (destinationNode: AudioNode) => void;
  disconnect: () => void;
  node: AudioNode;
  stop: () => void;
}

export interface BwCircleRealtimeBpmBridge {
  disconnect: () => void;
}

export interface BwCircleRealtimeBpmBridgeInput {
  audioContext: AudioContext;
  onBpm: (bpm: number) => void;
  sourceNode: AudioNode;
}

const BPM_ANALYZER_OPTIONS = {
  continuousAnalysis: true,
  debug: false,
  stabilizationTime: 8_000,
} as const;

const BPM_INPUT_GAIN_VALUE = 6;

function readBwCircleRealtimeTempo(candidates: BwCircleTempoCandidates | null) {
  const tempo = candidates?.bpm[0]?.tempo;

  return typeof tempo === "number" ? Math.round(tempo) : null;
}

export async function createBwCircleRealtimeBpmBridge({
  audioContext,
  onBpm,
  sourceNode,
}: BwCircleRealtimeBpmBridgeInput): Promise<BwCircleRealtimeBpmBridge> {
  const analyzer = (await createRealtimeBpmAnalyzer(
    audioContext,
    BPM_ANALYZER_OPTIONS,
  )) as BwCircleRealtimeBpmAnalyzerLike;
  const signalGainNode = audioContext.createGain();
  const mutedSinkNode = audioContext.createGain();

  signalGainNode.gain.value = BPM_INPUT_GAIN_VALUE;
  mutedSinkNode.gain.value = 0;

  const createTempoEventHandler = () => (event: Event) => {
    const detail =
      (event as CustomEvent<BwCircleTempoCandidates>).detail ?? null;

    const bpm = readBwCircleRealtimeTempo(detail);

    if (bpm !== null) {
      onBpm(bpm);
    }
  };
  const handleBpmEvent = createTempoEventHandler();
  const handleBpmStableEvent = createTempoEventHandler();

  analyzer.addEventListener("bpm", handleBpmEvent);
  analyzer.addEventListener("bpmStable", handleBpmStableEvent);

  sourceNode.connect(signalGainNode);
  signalGainNode.connect(analyzer.node);
  analyzer.connect(mutedSinkNode);
  mutedSinkNode.connect(audioContext.destination);

  return {
    disconnect() {
      analyzer.removeEventListener("bpm", handleBpmEvent);
      analyzer.removeEventListener("bpmStable", handleBpmStableEvent);
      analyzer.stop();
      analyzer.disconnect();

      try {
        sourceNode.disconnect(signalGainNode);
      } catch {}

      try {
        signalGainNode.disconnect();
      } catch {}

      try {
        mutedSinkNode.disconnect();
      } catch {}
    },
  };
}
