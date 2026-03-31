export interface StaggeredTextTuning {
  fontWeight: number;
  handoffDelayMs: number;
  incomingDurationMs: number;
  incomingStaggerStepMs: number;
  letterSpacingEm: number;
  outgoingDurationMs: number;
  outgoingStaggerStepMs: number;
}

type StaggeredTextTuningKey = keyof StaggeredTextTuning;

interface StaggeredTextGuiControl {
  key: StaggeredTextTuningKey;
  label: string;
  max: number;
  min: number;
  step: number;
}

interface StaggeredTextGuiFolder {
  controls: StaggeredTextGuiControl[];
  title: string;
}

export const DEFAULT_STAGGERED_TEXT_TUNING: StaggeredTextTuning = {
  fontWeight: 700,
  handoffDelayMs: 60,
  incomingDurationMs: 710,
  incomingStaggerStepMs: 60,
  letterSpacingEm: 0,
  outgoingDurationMs: 788,
  outgoingStaggerStepMs: 60,
};

export const STAGGERED_TEXT_GUI_FOLDERS: StaggeredTextGuiFolder[] = [
  {
    title: "Typography",
    controls: [
      {
        key: "letterSpacingEm",
        label: "Letter Spacing",
        min: -0.08,
        max: 0.08,
        step: 0.001,
      },
      {
        key: "fontWeight",
        label: "Font Weight",
        min: 300,
        max: 900,
        step: 1,
      },
    ],
  },
  {
    title: "Timing",
    controls: [
      {
        key: "outgoingStaggerStepMs",
        label: "Out Stagger",
        min: 0,
        max: 240,
        step: 1,
      },
      {
        key: "incomingStaggerStepMs",
        label: "In Stagger",
        min: 0,
        max: 240,
        step: 1,
      },
      {
        key: "handoffDelayMs",
        label: "Handoff",
        min: 0,
        max: 400,
        step: 1,
      },
      {
        key: "outgoingDurationMs",
        label: "Out Duration",
        min: 100,
        max: 2000,
        step: 1,
      },
      {
        key: "incomingDurationMs",
        label: "In Duration",
        min: 100,
        max: 2000,
        step: 1,
      },
    ],
  },
];
