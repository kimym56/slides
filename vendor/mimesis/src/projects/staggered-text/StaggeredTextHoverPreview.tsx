"use client";

import { useReducedMotion } from "framer-motion";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
} from "react";
import { STAGGERED_TEXT_SHADOW_PROFILE } from "./staggeredTextShadowProfile";
import type { StaggeredTextTuning } from "./staggeredTextTuning";
import styles from "./StaggeredTextProject.module.css";

const DISPLAY_TEXT = "Start Deploying";
const EASE_CUSTOM = "cubic-bezier(0.16, 1, 0.3, 1)";
const HOVER_INSTRUCTION = "Hover to preview";

function createCharacterSlots(text: string) {
  const characterCount = Array.from(text).filter((char) => char !== " ").length;
  let staggerIndex = 0;

  return Array.from(text).map((char, index) => {
    const isSpace = char === " ";
    const slot = {
      char,
      id: `${char}-${index}`,
      isSpace,
      staggerIndex,
      reverseStaggerIndex: characterCount - staggerIndex - 1,
    };

    if (!isSpace) {
      staggerIndex += 1;
    }

    return slot;
  });
}

const CHARACTER_SLOTS = createCharacterSlots(DISPLAY_TEXT);

type MotionDriver = "css" | "waapi";
type CharacterPart = "outgoingArm" | "outgoingGlyph" | "incomingGlyph" | "shadow";
type CharacterAnimations = Partial<Record<CharacterPart, Animation>>;
type TimingStyle = CSSProperties & {
  "--handoff-delay"?: string;
  "--incoming-duration"?: string;
  "--incoming-stagger-step"?: string;
  "--outgoing-duration"?: string;
  "--outgoing-stagger-step"?: string;
  "--shadow-active-blur"?: string;
  "--shadow-active-opacity"?: string;
  "--shadow-rest-blur"?: string;
};
type WordmarkStyle = CSSProperties & {
  "--wordmark-font-weight"?: string;
  "--wordmark-letter-spacing"?: string;
};

function createPausedAnimation(
  element: HTMLElement | null,
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) {
  if (!element || typeof element.animate !== "function") {
    return undefined;
  }

  const animation = element.animate(keyframes, {
    ...options,
    fill: "both",
  });

  animation.pause();
  animation.currentTime = 0;

  return animation;
}

function subscribeToHydration() {
  return () => {};
}

export function StaggeredTextHoverPreview({
  tuning,
}: {
  tuning: StaggeredTextTuning;
}) {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const outgoingArmRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const outgoingGlyphRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const incomingGlyphRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const shadowRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const animationSetsRef = useRef<CharacterAnimations[]>([]);

  const prefersReducedMotion = shouldReduceMotion ?? false;
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );
  const motionDriver: MotionDriver =
    !isHydrated ||
    prefersReducedMotion ||
    typeof Element === "undefined" ||
    typeof Element.prototype.animate !== "function"
      ? "css"
      : "waapi";
  const {
    fontWeight,
    handoffDelayMs,
    incomingDurationMs,
    incomingStaggerStepMs,
    letterSpacingEm,
    outgoingDurationMs,
    outgoingStaggerStepMs,
  } = tuning;
  const timingStyle: TimingStyle = {
    "--handoff-delay": `${handoffDelayMs}ms`,
    "--incoming-duration": `${incomingDurationMs}ms`,
    "--incoming-stagger-step": `${incomingStaggerStepMs}ms`,
    "--outgoing-duration": `${outgoingDurationMs}ms`,
    "--outgoing-stagger-step": `${outgoingStaggerStepMs}ms`,
    "--shadow-active-blur": `${STAGGERED_TEXT_SHADOW_PROFILE.activeBlurPx}px`,
    "--shadow-active-opacity": `${STAGGERED_TEXT_SHADOW_PROFILE.activeOpacity}`,
    "--shadow-rest-blur": `${STAGGERED_TEXT_SHADOW_PROFILE.restBlurPx}px`,
  };
  const wordmarkStyle: WordmarkStyle = {
    "--wordmark-font-weight": `${fontWeight}`,
    "--wordmark-letter-spacing": `${letterSpacingEm}em`,
  };

  useEffect(() => {
    if (motionDriver !== "waapi") {
      animationSetsRef.current.forEach((animations) => {
        Object.values(animations).forEach((animation) => animation?.cancel());
      });
      animationSetsRef.current = [];
      return;
    }

    const animations = CHARACTER_SLOTS.filter((slot) => !slot.isSpace).map((slot) => {
      const index = slot.staggerIndex;
      const reverseDelay = slot.reverseStaggerIndex * outgoingStaggerStepMs;

      return {
        outgoingArm: createPausedAnimation(
          outgoingArmRefs.current[index],
          [
            { opacity: 1, transform: "none" },
            { opacity: 0.92, transform: "translateY(-0.12em) rotateX(82deg)" },
          ],
          {
            delay: index * outgoingStaggerStepMs,
            duration: outgoingDurationMs,
            easing: EASE_CUSTOM,
            endDelay: reverseDelay,
          },
        ),
        outgoingGlyph: createPausedAnimation(
          outgoingGlyphRefs.current[index],
          [
            { filter: "blur(0)", opacity: 1, transform: "translateZ(0.02em)" },
            {
              filter: "blur(8px)",
              opacity: 0,
              transform: "translateY(-0.1em) translateZ(0.14em) rotateX(-18deg)",
            },
          ],
          {
            delay: index * outgoingStaggerStepMs,
            duration: outgoingDurationMs,
            easing: EASE_CUSTOM,
            endDelay: reverseDelay,
          },
        ),
        incomingGlyph: createPausedAnimation(
          incomingGlyphRefs.current[index],
          [
            {
              filter: "blur(8px)",
              opacity: 0,
              transform: "translateY(-0.02em) rotateX(-88deg) translateZ(0)",
            },
            {
              filter: "blur(0)",
              opacity: 1,
              transform: "translateY(-0.02em) rotateX(0deg) translateZ(0)",
            },
          ],
          {
            delay: index * incomingStaggerStepMs + handoffDelayMs,
            duration: incomingDurationMs,
            easing: EASE_CUSTOM,
            endDelay: slot.reverseStaggerIndex * incomingStaggerStepMs,
          },
        ),
          shadow: createPausedAnimation(
          shadowRefs.current[index],
          [
            {
              filter: `blur(${STAGGERED_TEXT_SHADOW_PROFILE.restBlurPx}px)`,
              opacity: 0,
              transform: "translateY(0.28em) scale(1.03)",
            },
            {
              filter: `blur(${STAGGERED_TEXT_SHADOW_PROFILE.activeBlurPx}px)`,
              opacity: STAGGERED_TEXT_SHADOW_PROFILE.activeOpacity,
              transform: "translateY(-0.04em) scale(1.04)",
            },
          ],
          {
            delay: index * outgoingStaggerStepMs,
            duration: outgoingDurationMs,
            easing: EASE_CUSTOM,
            endDelay: reverseDelay,
          },
        ),
      } satisfies CharacterAnimations;
    });

    animationSetsRef.current = animations;

    return () => {
      animations.forEach((animationSet) => {
        Object.values(animationSet).forEach((animation) => animation?.cancel());
      });
      animationSetsRef.current = [];
    };
  }, [
    handoffDelayMs,
    incomingDurationMs,
    incomingStaggerStepMs,
    motionDriver,
    outgoingDurationMs,
    outgoingStaggerStepMs,
  ]);

  useEffect(() => {
    if (motionDriver !== "waapi") {
      return;
    }

    animationSetsRef.current.forEach((animationSet) => {
      Object.values(animationSet).forEach((animation) => {
        if (!animation) {
          return;
        }

        if (isHovered) {
          animation.playbackRate = 1;
          animation.play();
          return;
        }

        const currentTime =
          typeof animation.currentTime === "number" ? animation.currentTime : 0;

        if (currentTime <= 0) {
          animation.pause();
          animation.currentTime = 0;
          return;
        }

        animation.playbackRate = -1;
        animation.play();
      });
    });
  }, [
    handoffDelayMs,
    incomingDurationMs,
    incomingStaggerStepMs,
    isHovered,
    motionDriver,
    outgoingDurationMs,
    outgoingStaggerStepMs,
  ]);

  return (
    <div
      className={`${styles.interactivePane} ${styles.trigger} ${styles.hoverStage}`}
      data-implementation="hover"
      data-active={isHovered}
      data-motion-driver={motionDriver}
      data-reduced-motion={prefersReducedMotion}
      style={timingStyle}
      onPointerEnter={() => {
        setIsHovered(true);
      }}
      onPointerLeave={() => {
        setIsHovered(false);
      }}
    >
      <p className={styles.previewInstruction} data-preview-instruction>
        {HOVER_INSTRUCTION}
      </p>
      <span className={styles.wordmark} style={wordmarkStyle}>
        {CHARACTER_SLOTS.map((slot) => {
          if (slot.isSpace) {
            return (
              <span key={slot.id} className={styles.space} aria-hidden="true">
                {" "}
              </span>
            );
          }

          return (
            <span
              key={slot.id}
              className={styles.slot}
              data-slot="character"
              style={
                {
                  "--char-index": slot.staggerIndex,
                  "--char-reverse-index": slot.reverseStaggerIndex,
                } as CSSProperties
              }
            >
              <span className={styles.slotSizer} data-part="slot-sizer" aria-hidden="true">
                {slot.char}
              </span>
              <span
                className={styles.outgoingArm}
                data-part="outgoing-arm"
                ref={(node) => {
                  outgoingArmRefs.current[slot.staggerIndex] = node;
                }}
              >
                <span
                  className={styles.outgoingGlyph}
                  data-part="outgoing-glyph"
                  ref={(node) => {
                    outgoingGlyphRefs.current[slot.staggerIndex] = node;
                  }}
                >
                  {slot.char}
                </span>
              </span>
              <span
                className={styles.incomingGlyph}
                data-part="incoming-glyph"
                ref={(node) => {
                  incomingGlyphRefs.current[slot.staggerIndex] = node;
                }}
              >
                {slot.char}
              </span>
              <span
                className={styles.shadow}
                aria-hidden="true"
                ref={(node) => {
                  shadowRefs.current[slot.staggerIndex] = node;
                }}
              >
                {slot.char}
              </span>
            </span>
          );
        })}
      </span>
    </div>
  );
}
