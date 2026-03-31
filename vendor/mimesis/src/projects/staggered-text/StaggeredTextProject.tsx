"use client";

import { useState } from "react";
import type { InteractiveProjectProps } from "../types";
import { StaggeredTextButtonPreview } from "./StaggeredTextButtonPreview";
import { StaggeredTextHoverPreview } from "./StaggeredTextHoverPreview";
import styles from "./StaggeredTextProject.module.css";
import { DEFAULT_STAGGERED_TEXT_TUNING } from "./staggeredTextTuning";
import { useStaggeredTextGui } from "./useStaggeredTextGui";

type PreviewMode = "hover" | "button";

const DEFAULT_BUTTON_TEXT = "";

function resolveInitialMode(initialMode?: string): PreviewMode {
  return initialMode === "button" ? "button" : "hover";
}

export default function StaggeredTextProject({
  hideControls,
  initialMode,
  projectId,
}: InteractiveProjectProps) {
  const [mode, setMode] = useState<PreviewMode>(() =>
    resolveInitialMode(initialMode),
  );
  const [buttonText, setButtonText] = useState(DEFAULT_BUTTON_TEXT);
  const [tuning, setTuning] = useState(DEFAULT_STAGGERED_TEXT_TUNING);

  useStaggeredTextGui({
    enabled: true,
    setTuning,
    tuning,
  });

  return (
    <div className={styles.projectShell} data-project-id={projectId}>
      {!hideControls && (
        <div className={styles.controls}>
          <div
            className={styles.modeToggle}
            role="tablist"
            aria-label="Staggered text preview mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "hover"}
              className={`${styles.modeButton} ${mode === "hover" ? styles.modeButtonActive : ""}`}
              data-mode-toggle="hover"
              onClick={() => {
                setMode("hover");
              }}
            >
              Hover
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "button"}
              className={`${styles.modeButton} ${mode === "button" ? styles.modeButtonActive : ""}`}
              data-mode-toggle="button"
              onClick={() => {
                setMode("button");
              }}
            >
              Button
            </button>
          </div>
        </div>
      )}
      <div className={styles.previewFrame}>
        {mode === "hover" ? (
          <StaggeredTextHoverPreview tuning={tuning} />
        ) : (
          <StaggeredTextButtonPreview
            text={buttonText}
            onTextChange={setButtonText}
            tuning={tuning}
          />
        )}
      </div>
    </div>
  );
}
