import { useEffect, useRef, useState } from "react";
import { getSlides, type Locale } from "./deck/slideData";
import { preloadMimesisSlideAssets } from "./mimesis/preloadMimesisAssets";

type BrowserLocaleSource = Pick<Navigator, "language" | "languages">;

const localePaths = {
  en: "/en",
  ko: "/kr",
} satisfies Record<Locale, string>;

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
    languageLabel: "Language",
    navigationLabel: "Slide navigation",
    nextSlide: "Next slide",
    previousSlide: "Previous slide",
  },
  ko: {
    keyboardHelpAction: "다음",
    keyboardHelpFullscreen: "전체 화면",
    keyboardHelpNavigate: "이동",
    languageLabel: "언어",
    navigationLabel: "슬라이드 탐색",
    nextSlide: "다음 슬라이드",
    previousSlide: "이전 슬라이드",
  },
} satisfies Record<Locale, {
  keyboardHelpAction: string;
  keyboardHelpFullscreen: string;
  keyboardHelpNavigate: string;
  languageLabel: string;
  navigationLabel: string;
  nextSlide: string;
  previousSlide: string;
}>;

function normalizePathname(pathname: string) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return normalizedPath === "" ? "/" : normalizedPath;
}

function getExplicitLocaleFromPathname(pathname: string): Locale | null {
  const normalizedPath = normalizePathname(pathname);

  if (normalizedPath === localePaths.en || normalizedPath.startsWith(`${localePaths.en}/`)) {
    return "en";
  }

  if (normalizedPath === localePaths.ko || normalizedPath.startsWith(`${localePaths.ko}/`)) {
    return "ko";
  }

  return null;
}

export function detectBrowserLocale(
  browserLocaleSource: BrowserLocaleSource = window.navigator,
): Locale {
  const candidates = browserLocaleSource.languages?.length
    ? browserLocaleSource.languages
    : [browserLocaleSource.language];

  return candidates.some((value) => value.toLowerCase().startsWith("ko")) ? "ko" : "en";
}

function resolveLocaleRoute(
  pathname: string,
  browserLocaleSource: BrowserLocaleSource = window.navigator,
) {
  const explicitLocale = getExplicitLocaleFromPathname(pathname);
  const locale = explicitLocale ?? detectBrowserLocale(browserLocaleSource);
  const canonicalPath = localePaths[locale];

  return {
    canonicalPath,
    locale,
    needsRedirect: explicitLocale === null,
  };
}

export function getLocaleFromPathname(
  pathname: string,
  browserLocaleSource: BrowserLocaleSource = window.navigator,
): Locale {
  return resolveLocaleRoute(pathname, browserLocaleSource).locale;
}

function getLocalePath(locale: Locale) {
  return localePaths[locale];
}

function isPdfExportSearch(search: string) {
  return new URLSearchParams(search).get("export") === "pdf";
}

export default function App() {
  const [resolvedRoute] = useState(() => resolveLocaleRoute(window.location.pathname));
  const locale = resolvedRoute.locale;
  const isPdfExport = isPdfExportSearch(window.location.search);
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
    const nextRoute = resolveLocaleRoute(window.location.pathname);

    if (!nextRoute.needsRedirect) {
      return;
    }

    window.history.replaceState(
      {},
      "",
      `${nextRoute.canonicalPath}${window.location.search}${window.location.hash}`,
    );
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    if (isPdfExport) {
      document.body.dataset.exportMode = "pdf";
      document.documentElement.dataset.exportMode = "pdf";
      return () => {
        delete document.body.dataset.exportMode;
        delete document.documentElement.dataset.exportMode;
      };
    }

    delete document.body.dataset.exportMode;
    delete document.documentElement.dataset.exportMode;
  }, [isPdfExport]);

  useEffect(() => {
    if (isPdfExport) {
      return;
    }

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
  }, [isPdfExport, totalSlides]);

  return (
    <>
      <main className={`deck-container ${isPdfExport ? "deck-container--export" : ""}`.trim()}>
        {slides.map((slide, index) => (
          <section
            key={slide.id}
            className={`slide ${(isPdfExport || index === currentSlide) ? "active" : ""} ${isPdfExport ? "slide--export" : ""}`.trim()}
            data-title={slide.title}
            id={slide.id}
          >
            {slide.render({ isActive: isPdfExport || index === currentSlide })}
          </section>
        ))}
      </main>

      {isPdfExport ? null : (
        <>
          {currentSlide === 0 ? (
            <nav className="locale-toggle" aria-label={chromeCopy.languageLabel}>
              <a
                href={getLocalePath("en")}
                className={`locale-toggle-link ${locale === "en" ? "is-active" : ""}`.trim()}
                aria-current={locale === "en" ? "page" : undefined}
              >
                EN
              </a>
              <span className="locale-toggle-divider">/</span>
              <a
                href={getLocalePath("ko")}
                className={`locale-toggle-link ${locale === "ko" ? "is-active" : ""}`.trim()}
                aria-current={locale === "ko" ? "page" : undefined}
              >
                KR
              </a>
            </nav>
          ) : null}

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
      )}
    </>
  );
}
