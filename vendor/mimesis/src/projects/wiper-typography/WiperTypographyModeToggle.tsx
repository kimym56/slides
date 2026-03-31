"use client";

import styles from "./WiperTypographyProject.module.css";

export type WiperRenderMode = "2d" | "3d-driver";

interface WiperModeOption {
  id: WiperRenderMode;
  label: string;
}

const MODE_OPTIONS: WiperModeOption[] = [
  { id: "2d", label: "2D Canvas" },
  { id: "3d-driver", label: "3D Driver View" },
];

export default function WiperTypographyModeToggle({
  activeMode,
  onChange,
}: {
  activeMode: WiperRenderMode;
  onChange: (mode: WiperRenderMode) => void;
}) {
  return (
    <div className={styles.modeToggle}>
      {MODE_OPTIONS.map((option) => (
        <button
          key={option.id}
          className={`${styles.modeButton} ${
            activeMode === option.id ? styles.modeButtonActive : ""
          }`}
          data-mode={option.id}
          onClick={() => onChange(option.id)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
