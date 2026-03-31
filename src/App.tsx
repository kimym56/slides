import { useEffect, useRef, useState } from "react";
import { getSlides, type Locale } from "./deck/slideData";
import { preloadMimesisSlideAssets } from "./mimesis/preloadMimesisAssets";

function isDemoInteractionTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest("[data-demo-interaction-zone]"));
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  if (target.isContentEditable) {
    return true;
  }

  return Boolean(target.closest("input, textarea, select, button, [contenteditable='true']"));
}

const deckChromeCopy = {
  en: {
    keyboardHelpAction: "next",
    keyboardHelpFullscreen: "full screen",
    keyboardHelpNavigate: "navigate",
    navigationLabel: "Slide navigation",
    nextSlide: "Next slide",
    previousSlide: "Previous slide",
  },
  ko: {
    keyboardHelpAction: "다음",
    keyboardHelpFullscreen: "전체 화면",
    keyboardHelpNavigate: "이동",
    navigationLabel: "슬라이드 탐색",
    nextSlide: "다음 슬라이드",
    previousSlide: "이전 슬라이드",
  },
} satisfies Record<Locale, {
  keyboardHelpAction: string;
  keyboardHelpFullscreen: string;
  keyboardHelpNavigate: string;
  navigationLabel: string;
  nextSlide: string;
  previousSlide: string;
}>;

export function getLocaleFromPathname(pathname: string): Locale {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return normalizedPath.endsWith("/kr") ? "ko" : "en";
}

export default function App() {
  const locale = getLocaleFromPathname(window.location.pathname);
  const slides = getSlides(locale);
  const chromeCopy = deckChromeCopy[locale];
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = slides.length;
  const progress = totalSlides > 1 ? (currentSlide / (totalSlides - 1)) * 100 : 0;
  const wheelThrottleRef = useRef<number | null>(null);

  useEffect(() => {
    preloadMimesisSlideAssets();
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    const nextSlide = () => {
      setCurrentSlide((current) => Math.min(current + 1, totalSlides - 1));
    };

    const prevSlide = () => {
      setCurrentSlide((current) => Math.max(current - 1, 0));
    };

    const toggleFullScreen = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch((error: unknown) => {
          console.warn("Error attempting to enable fullscreen:", error);
        });
        return;
      }

      document.exitFullscreen?.();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (
        isDemoInteractionTarget(event.target)
        || isEditableTarget(event.target)
        || isDemoInteractionTarget(document.activeElement)
      ) {
        return;
      }

      if (
        event.key === "ArrowRight" ||
        event.key === " " ||
        event.code === "Space" ||
        event.key === ">"
      ) {
        nextSlide();
        return;
      }

      if (event.key === "ArrowLeft" || event.key === "<") {
        prevSlide();
        return;
      }

      if (event.key === "f" || event.key === "F") {
        toggleFullScreen();
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (wheelThrottleRef.current !== null || Math.abs(event.deltaY) <= 20) {
        return;
      }

      if (isDemoInteractionTarget(event.target)) {
        return;
      }

      if (event.deltaY > 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      wheelThrottleRef.current = window.setTimeout(() => {
        wheelThrottleRef.current = null;
      }, 1000);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("wheel", onWheel);

    return () => {
      if (wheelThrottleRef.current !== null) {
        window.clearTimeout(wheelThrottleRef.current);
        wheelThrottleRef.current = null;
      }

      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("wheel", onWheel);
    };
  }, [totalSlides]);

  return (
    <>
      <main className="deck-container">
        {slides.map((slide, index) => (
          <section
            key={slide.id}
            className={`slide ${index === currentSlide ? "active" : ""}`}
            data-title={slide.title}
            id={slide.id}
          >
            {slide.render({ isActive: index === currentSlide })}
          </section>
        ))}
      </main>

      <div className="progress-bar" aria-hidden="true">
        <div
          className="progress-fill"
          id="progress-indicator"
          style={{ width: `${progress}%` }}
        />
      </div>

      <nav className="slider-nav" aria-label={chromeCopy.navigationLabel}>
        <div className="current-section-label" id="current-section">
          {slides[currentSlide]?.title}
        </div>
        <div className={`keyboard-help ${currentSlide >= 2 ? "hidden" : ""}`}>
          <kbd>Space</kbd> {chromeCopy.keyboardHelpAction} &middot; <kbd>&larr;</kbd>
          <kbd>&rarr;</kbd> {chromeCopy.keyboardHelpNavigate} &middot; <kbd>F</kbd>{" "}
          {chromeCopy.keyboardHelpFullscreen}
        </div>
        <div className="controls">
          <button
            id="btn-prev"
            className="nav-btn"
            aria-label={chromeCopy.previousSlide}
            disabled={currentSlide === 0}
            onClick={() => {
              setCurrentSlide((current) => Math.max(current - 1, 0));
            }}
            type="button"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span id="slide-counter">{currentSlide + 1} / {totalSlides}</span>
          <button
            id="btn-next"
            className="nav-btn"
            aria-label={chromeCopy.nextSlide}
            disabled={currentSlide === totalSlides - 1}
            onClick={() => {
              setCurrentSlide((current) => Math.min(current + 1, totalSlides - 1));
            }}
            type="button"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </nav>
    </>
  );
}
