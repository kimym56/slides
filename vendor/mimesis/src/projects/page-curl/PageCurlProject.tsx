"use client";

import { useState } from "react";
import PageCurlEmbed from "./PageCurlEmbed";
import PageCurlEmbed3D from "./PageCurlEmbed3D";
import type { InteractiveProjectProps } from "../types";
import styles from "./PageCurlProject.module.css";

function resolveInitialMode(initialMode?: string): "2d" | "3d" {
  return initialMode === "3d" ? "3d" : "2d";
}

export default function PageCurlProject({
  hideControls,
  initialMode,
  projectId,
}: InteractiveProjectProps) {
  const [mode, setMode] = useState<"2d" | "3d">(() =>
    resolveInitialMode(initialMode),
  );

  return (
    <div className={styles.interactivePane} data-project-id={projectId}>
      {!hideControls && (
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeButton} ${mode === "2d" ? styles.modeButtonActive : ""}`}
            onClick={() => setMode("2d")}
            type="button"
          >
            2D Canvas
          </button>
          <button
            className={`${styles.modeButton} ${mode === "3d" ? styles.modeButtonActive : ""}`}
            onClick={() => setMode("3d")}
            type="button"
          >
            3D Shader
          </button>
        </div>
      )}
      {mode === "2d" ? <PageCurlEmbed /> : <PageCurlEmbed3D hideControls={hideControls} />}
    </div>
  );
}
