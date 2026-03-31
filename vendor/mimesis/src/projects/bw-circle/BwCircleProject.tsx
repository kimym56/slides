"use client";

import { useRef, useState } from "react";
import type { InteractiveProjectProps } from "../types";
import styles from "./BwCircleProject.module.css";
import BwCircleScene from "./BwCircleScene";
import BwCircleYouTubePanel from "./BwCircleYouTubePanel";

type BwCircleProjectMode = "mimesis" | "sync";

export interface BwCirclePlaybackState {
  currentTime: number;
  isPlaying: boolean;
  sampledAtMs: number;
}

export type BwCircleAudioSyncStatus =
  | "idle"
  | "prompting"
  | "active"
  | "denied"
  | "unsupported";

export interface BwCircleAudioSyncState {
  status: BwCircleAudioSyncStatus;
  stream: MediaStream | null;
}

const IDLE_PLAYBACK_STATE: BwCirclePlaybackState = {
  currentTime: 0,
  isPlaying: false,
  sampledAtMs: 0,
};

const IDLE_AUDIO_SYNC_STATE: BwCircleAudioSyncState = {
  status: "idle",
  stream: null,
};
const AUDIO_SYNC_PERMISSION_COPY =
  "*Allow permission to use audio sync for this feature.";

function resolveInitialMode(initialMode?: string): BwCircleProjectMode {
  return initialMode === "sync" ? "sync" : "mimesis";
}

export default function BwCircleProject({
  hideControls,
  initialMode,
  projectId,
}: InteractiveProjectProps) {
  const [mode, setMode] = useState<BwCircleProjectMode>(() =>
    resolveInitialMode(initialMode),
  );
  const [videoId, setVideoId] = useState<string | null>(null);
  const [audioSync, setAudioSync] = useState<BwCircleAudioSyncState>(
    IDLE_AUDIO_SYNC_STATE,
  );
  const [estimatedBpm, setEstimatedBpm] = useState<number | null>(null);
  const playbackRef = useRef<BwCirclePlaybackState>(IDLE_PLAYBACK_STATE);
  const syncBpm = 120;

  const handleModeChange = (nextMode: BwCircleProjectMode) => {
    setMode(nextMode);

    if (nextMode === "mimesis") {
      playbackRef.current = IDLE_PLAYBACK_STATE;
      setEstimatedBpm(null);
    }
  };

  const handleVideoLoad = (nextVideoId: string | null) => {
    setVideoId(nextVideoId);
    playbackRef.current = IDLE_PLAYBACK_STATE;
    setEstimatedBpm(null);
  };

  const handlePlaybackChange = (nextPlayback: BwCirclePlaybackState) => {
    playbackRef.current = nextPlayback;
  };

  const handleAudioSyncChange = (nextAudioSync: BwCircleAudioSyncState) => {
    setAudioSync(nextAudioSync);

    if (nextAudioSync.status !== "active") {
      setEstimatedBpm(null);
    }
  };

  return (
    <div className={styles.interactivePane} data-project-id={projectId}>
      {!hideControls && (
        <div className={styles.modeToggleRow} data-sync-mode-row="true">
          <div className={styles.modeToggle}>
            <button
              className={`${styles.modeButton} ${mode === "mimesis" ? styles.modeButtonActive : ""}`}
              data-mode="mimesis"
              onClick={() => handleModeChange("mimesis")}
              type="button"
            >
              Mimesis
            </button>
            <button
              className={`${styles.modeButton} ${mode === "sync" ? styles.modeButtonActive : ""}`}
              data-mode="sync"
              onClick={() => handleModeChange("sync")}
              type="button"
            >
              Sync
            </button>
          </div>
          {mode === "sync" && audioSync.status !== "active" ? (
            <p className={styles.permissionText}>
              {AUDIO_SYNC_PERMISSION_COPY}
            </p>
          ) : null}
        </div>
      )}
      <BwCircleScene
        audioSync={audioSync}
        bpm={syncBpm}
        mode={mode}
        onEstimatedBpmChange={setEstimatedBpm}
        playbackRef={playbackRef}
        syncOverlay={
          mode === "sync" ? (
            <BwCircleYouTubePanel
              audioSyncStatus={audioSync.status}
              estimatedBpm={estimatedBpm}
              onAudioSyncChange={handleAudioSyncChange}
              onLoad={handleVideoLoad}
              onPlaybackChange={handlePlaybackChange}
              videoId={videoId}
            />
          ) : null
        }
      />
    </div>
  );
}
