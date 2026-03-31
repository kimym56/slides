"use client";

import { startTransition, useEffect, useRef, type Dispatch, type SetStateAction } from "react";
import {
  STAGGERED_TEXT_GUI_FOLDERS,
  type StaggeredTextTuning,
} from "./staggeredTextTuning";

type GuiController = {
  name: (label: string) => GuiController;
  onChange: (handler: (value: number) => void) => GuiController;
};

type GuiFolder = {
  add: (
    target: Record<string, number>,
    key: string,
    min: number,
    max: number,
    step: number
  ) => GuiController;
  close: () => GuiFolder;
};

type GuiInstance = {
  addFolder: (title: string) => GuiFolder;
  close: () => GuiInstance;
  destroy: () => void;
};

export function useStaggeredTextGui({
  enabled,
  setTuning,
  tuning,
}: {
  enabled: boolean;
  setTuning: Dispatch<SetStateAction<StaggeredTextTuning>>;
  tuning: StaggeredTextTuning;
}) {
  const tuningRef = useRef(tuning);

  useEffect(() => {
    tuningRef.current = tuning;
  }, [tuning]);

  useEffect(() => {
    if (!enabled || process.env.NODE_ENV !== "development") {
      return;
    }

    let cancelled = false;
    let gui: GuiInstance | null = null;
    const draftValues = { ...tuningRef.current } as Record<string, number>;

    void import("lil-gui").then(({ GUI }) => {
      if (cancelled) {
        return;
      }

      gui = new GUI({
        closeFolders: true,
        title: "Staggered Text Timing",
      }) as GuiInstance;

      gui.close();

      for (const folderConfig of STAGGERED_TEXT_GUI_FOLDERS) {
        const folder = gui.addFolder(folderConfig.title);

        for (const control of folderConfig.controls) {
          folder
            .add(
              draftValues,
              control.key,
              control.min,
              control.max,
              control.step,
            )
            .name(control.label)
            .onChange((value: number) => {
              startTransition(() => {
                setTuning((current) => ({
                  ...current,
                  [control.key]: value,
                }));
              });
            });
        }

        folder.close();
      }
    });

    return () => {
      cancelled = true;
      gui?.destroy();
    };
  }, [enabled, setTuning]);
}
