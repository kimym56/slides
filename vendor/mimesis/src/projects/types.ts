import type { ComponentType } from "react";

export interface InteractiveProjectProps {
  initialMode?: string;
  projectId: string;
  onViewStateChange?: (state: { renderMode?: string }) => void;
  hideControls?: boolean;
}

export type InteractiveProjectComponent =
  ComponentType<InteractiveProjectProps>;
