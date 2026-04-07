import { Suspense, lazy, type ComponentType, type ReactNode } from "react";
import { deckCopy, type Locale } from "./deckCopy";

export type { Locale } from "./deckCopy";

const PageCurlSlideDemo = lazy(() => import("../mimesis/PageCurlSlideDemo"));
const WiperTypographySlideDemo = lazy(
  () => import("../mimesis/WiperTypographySlideDemo"),
);
const BwCircleSlideDemo = lazy(() => import("../mimesis/BwCircleSlideDemo"));
const StaggeredTextSlideDemo = lazy(
  () => import("../mimesis/StaggeredTextSlideDemo"),
);

interface SlideDefinition {
  id: string;
  render: (context: { isActive: boolean }) => ReactNode;
  title: string;
}

interface MimesisDetailSlideOptions {
  copyClassName?: string;
  descriptions: ReactNode[];
  demoSide?: "left" | "right";
  detailTitle: string;
  renderDemo: () => ReactNode;
}

interface ProjectImageDetailSlideOptions {
  copyClassName?: string;
  descriptions: ReactNode[];
  detailTitle: string;
  imageAlt: string;
  imageClassName?: string;
  imageSide?: "left" | "right";
  imageSlotClassName?: string;
  imageSrc: string;
}

interface ProjectOverviewSlideOptions {
  description: string;
  features: string[];
  featuresLabel: string;
  media: ReactNode;
  projectNumber: string;
  projectTitle: string;
  projectUrl: string;
  techStack: string[];
}

const heroWordmarkCharacters: Record<
  Locale,
  Array<{ char: string; className: string }>
> = {
  en: [
    { char: "P", className: "hero-wordmark-char--en-p" },
    { char: "o", className: "hero-wordmark-char--en-o1" },
    { char: "r", className: "hero-wordmark-char--en-r" },
    { char: "t", className: "hero-wordmark-char--en-t" },
    { char: "f", className: "hero-wordmark-char--en-f" },
    { char: "o", className: "hero-wordmark-char--en-o2" },
    { char: "l", className: "hero-wordmark-char--en-l" },
    { char: "i", className: "hero-wordmark-char--en-i" },
    { char: "o", className: "hero-wordmark-char--en-o3" },
  ],
  ko: [
    { char: "포", className: "hero-wordmark-char--ko-po" },
    { char: "트", className: "hero-wordmark-char--ko-teu" },
    { char: "폴", className: "hero-wordmark-char--ko-pol" },
    { char: "리", className: "hero-wordmark-char--ko-ri" },
    { char: "오", className: "hero-wordmark-char--ko-o" },
  ],
};

function renderHeroWordmark(locale: Locale, title: string) {
  const characters = heroWordmarkCharacters[locale];

  if (characters.map((entry) => entry.char).join("") !== title) {
    return title;
  }

  return (
    <span className={`hero-wordmark hero-wordmark--${locale}`}>
      {characters.map(({ char, className }, index) => (
        <span
          key={`${locale}-${className}-${index}`}
          className={`hero-wordmark-char ${className}`}
        >
          {char}
        </span>
      ))}
    </span>
  );
}

function renderStructuredDetailsCopy(
  detailTitle: string,
  descriptions: ReactNode[],
  copyClassName?: string,
) {
  const [leadDescription, ...bulletDescriptions] = descriptions;

  return (
    <div
      className={`details-copy details-copy--structured ${copyClassName ?? ""}`.trim()}
    >
      <h3 className="details-title">{detailTitle}</h3>
      {leadDescription ? (
        <p className="details-lead">{leadDescription}</p>
      ) : null}
      {bulletDescriptions.length > 0 ? (
        <ul className="details-list">
          {bulletDescriptions.map((description, index) => (
            <li key={index} className="details-list-item">
              {description}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function renderLazyMimesisDemo(DemoComponent: ComponentType) {
  return (
    <Suspense fallback={null}>
      <DemoComponent />
    </Suspense>
  );
}

function renderMimesisDetailSlide(
  { isActive }: { isActive: boolean },
  {
    copyClassName,
    descriptions,
    demoSide = "left",
    detailTitle,
    renderDemo,
  }: MimesisDetailSlideOptions,
) {
  const demo = (
    <div className="project-demo-slot">{isActive ? renderDemo() : null}</div>
  );
  const explanation = renderStructuredDetailsCopy(
    detailTitle,
    descriptions,
    copyClassName,
  );

  return (
    <div className="slide-content project-details-layout project-details-layout--structured project-details-layout--content-centered">
      <div className="details-column stagger-1">
        {demoSide === "left" ? demo : explanation}
      </div>
      <div className="details-column stagger-2">
        {demoSide === "left" ? explanation : demo}
      </div>
    </div>
  );
}

function renderProjectImageDetailSlide(
  { isActive }: { isActive: boolean },
  {
    copyClassName,
    descriptions,
    detailTitle,
    imageAlt,
    imageClassName,
    imageSide = "right",
    imageSlotClassName,
    imageSrc,
  }: ProjectImageDetailSlideOptions,
) {
  const image = (
    <div
      className={`project-detail-image-slot project-detail-image-slot--intrinsic ${imageSlotClassName ?? ""}`.trim()}
    >
      {isActive ? (
        <img
          className={`project-detail-image ${imageClassName ?? ""}`.trim()}
          src={imageSrc}
          alt={imageAlt}
        />
      ) : null}
    </div>
  );
  const explanation = renderStructuredDetailsCopy(
    detailTitle,
    descriptions,
    copyClassName,
  );

  return (
    <div className="slide-content project-details-layout project-details-layout--structured project-details-layout--content-centered">
      <div
        className={`details-column ${imageSide === "left" ? "details-column--image-media" : "details-column--image-copy"} stagger-1`.trim()}
      >
        {imageSide === "left" ? image : explanation}
      </div>
      <div
        className={`details-column ${imageSide === "left" ? "details-column--image-copy" : "details-column--image-media"} stagger-2`.trim()}
      >
        {imageSide === "left" ? explanation : image}
      </div>
    </div>
  );
}

function renderProjectOverviewSlide({
  description,
  features,
  featuresLabel,
  media,
  projectNumber,
  projectTitle,
  projectUrl,
  techStack,
}: ProjectOverviewSlideOptions) {
  return (
    <div className="slide-content project-split-layout">
      <div className="project-info">
        <div className="project-header stagger-1">
          <span className="project-number">{projectNumber}</span>
          <h2 className="project-title">{projectTitle}</h2>
        </div>
        <a
          className="project-link project-subtitle stagger-2"
          href={projectUrl}
          target="_blank"
          rel="noreferrer"
        >
          {projectUrl}
        </a>
        <p className="project-description stagger-3">{description}</p>
        <div className="project-features stagger-4">
          <h4>{featuresLabel}</h4>
          <ul>
            {features.map((feature, index) => (
              <li key={index}>{feature}</li>
            ))}
          </ul>
        </div>
        <div className="tech-stack stagger-5">
          {techStack.map((tag, index) => (
            <span key={`${tag}-${index}`} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </div>
      {media}
    </div>
  );
}

export function getSlides(locale: Locale): SlideDefinition[] {
  const copy = deckCopy[locale];

  return [
    {
      id: "slide-1",
      title: copy.portfolio.title,
      render: () => (
        <div className="hero-center-content">
          <h1 className="hero-title stagger-1">
            {renderHeroWordmark(locale, copy.portfolio.heroTitle)}
          </h1>
          <div className="hero-subtext stagger-2">
            <span>{copy.portfolio.heroSubtitle}</span>
            <span>{copy.portfolio.year}</span>
          </div>
        </div>
      ),
    },
    {
      id: "slide-3",
      title: copy.introduction.title,
      render: () => (
        <div className="slide-content project-split-layout">
          <div className="intro-left-panel">
            <h2 className="intro-greeting stagger-1">{copy.introduction.greeting}</h2>
            <p className="intro-sentence stagger-2">{copy.introduction.sentence}</p>
            <div className="edu-experience stagger-3">
              <div className="resume-section">
                <h3>{copy.introduction.experienceLabel}</h3>
                <ul>
                  <li>
                    <span>{copy.introduction.experienceRole}</span>
                    <span className="date">{copy.introduction.experienceDate}</span>
                  </li>
                </ul>
              </div>
              <div className="resume-section">
                <h3>{copy.introduction.educationLabel}</h3>
                <ul>
                  <li>
                    <span>{copy.introduction.educationDegree}</span>
                    <span className="date">{copy.introduction.educationDate}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="intro-right-panel project-visual stagger-4">
            <img
              className="project-media"
              src="/images/profile.webp"
              alt={copy.introduction.profileAlt}
            />
          </div>
        </div>
      ),
    },
    {
      id: "slide-4",
      title: copy.mimesisOverview.title,
      render: () =>
        renderProjectOverviewSlide({
          description: copy.mimesisOverview.description,
          features: copy.mimesisOverview.features,
          featuresLabel: copy.mimesisOverview.featuresLabel,
          media: (
            <div className="project-visual stagger-6">
              <video className="project-media" autoPlay loop muted playsInline>
                <source src="/videos/mimesis_main.webm" type="video/webm" />
              </video>
            </div>
          ),
          projectUrl: copy.mimesisOverview.projectUrl,
          projectNumber: copy.mimesisOverview.projectNumber,
          projectTitle: copy.mimesisOverview.projectTitle,
          techStack: copy.mimesisOverview.techStack,
        }),
    },
    {
      id: "slide-5",
      title: copy.mimesisDetail1.title,
      render: (context) =>
        renderMimesisDetailSlide(context, {
          copyClassName: "details-copy--large-text",
          descriptions: copy.mimesisDetail1.descriptions,
          detailTitle: copy.mimesisDetail1.detailTitle,
          demoSide: "left",
          renderDemo: () => renderLazyMimesisDemo(PageCurlSlideDemo),
        }),
    },
    {
      id: "slide-6",
      title: copy.mimesisDetail2.title,
      render: (context) =>
        renderMimesisDetailSlide(context, {
          copyClassName: "details-copy--large-text",
          descriptions: copy.mimesisDetail2.descriptions,
          detailTitle: copy.mimesisDetail2.detailTitle,
          demoSide: "right",
          renderDemo: () => renderLazyMimesisDemo(WiperTypographySlideDemo),
        }),
    },
    {
      id: "slide-7",
      title: copy.mimesisDetail3.title,
      render: (context) =>
        renderMimesisDetailSlide(context, {
          copyClassName: "details-copy--large-text",
          descriptions: copy.mimesisDetail3.descriptions,
          detailTitle: copy.mimesisDetail3.detailTitle,
          demoSide: "left",
          renderDemo: () => renderLazyMimesisDemo(BwCircleSlideDemo),
        }),
    },
    {
      id: "slide-8",
      title: copy.mimesisDetail4.title,
      render: (context) =>
        renderMimesisDetailSlide(context, {
          copyClassName: "details-copy--large-text",
          descriptions: copy.mimesisDetail4.descriptions,
          detailTitle: copy.mimesisDetail4.detailTitle,
          demoSide: "right",
          renderDemo: () => renderLazyMimesisDemo(StaggeredTextSlideDemo),
        }),
    },
    {
      id: "slide-9",
      title: copy.dsskillsOverview.title,
      render: () =>
        renderProjectOverviewSlide({
          description: copy.dsskillsOverview.description,
          features: copy.dsskillsOverview.features,
          featuresLabel: copy.dsskillsOverview.featuresLabel,
          media: (
            <div className="project-visual stagger-6">
              <img
                className="project-media"
                src="/images/dsskills_main.png"
                alt={copy.dsskillsOverview.mediaAlt ?? ""}
              />
            </div>
          ),
          projectUrl: copy.dsskillsOverview.projectUrl,
          projectNumber: copy.dsskillsOverview.projectNumber,
          projectTitle: copy.dsskillsOverview.projectTitle,
          techStack: copy.dsskillsOverview.techStack,
        }),
    },
    {
      id: "slide-10",
      title: copy.dsskillsDetail1.title,
      render: (context) =>
        renderProjectImageDetailSlide(context, {
          copyClassName: "details-copy--large-text",
          descriptions: copy.dsskillsDetail1.descriptions,
          detailTitle: copy.dsskillsDetail1.detailTitle,
          imageAlt: copy.dsskillsDetail1.imageAlt,
          imageClassName: "dsskills-detail1-image",
          imageSlotClassName: "dsskills-detail1-slot",
          imageSide: "right",
          imageSrc: "/images/dsskills_detail1.png",
        }),
    },
    {
      id: "slide-11",
      title: copy.dsskillsDetail2.title,
      render: (context) =>
        renderProjectImageDetailSlide(context, {
          copyClassName: "details-copy--large-text",
          descriptions: copy.dsskillsDetail2.descriptions,
          detailTitle: copy.dsskillsDetail2.detailTitle,
          imageAlt: copy.dsskillsDetail2.imageAlt,
          imageClassName: "dsskills-detail2-image",
          imageSlotClassName: "dsskills-detail2-slot",
          imageSide: "left",
          imageSrc: "/images/dsskills_detail2.png",
        }),
    },
    {
      id: "slide-12",
      title: copy.sellpathOverview.title,
      render: () =>
        renderProjectOverviewSlide({
          description: copy.sellpathOverview.description,
          features: copy.sellpathOverview.features,
          featuresLabel: copy.sellpathOverview.featuresLabel,
          media: (
            <div className="project-visual stagger-6">
              <img
                className="project-media sellpath-main-media"
                src="/images/sellpath_main.png"
                alt={copy.sellpathOverview.mediaAlt ?? ""}
              />
            </div>
          ),
          projectUrl: copy.sellpathOverview.projectUrl,
          projectNumber: copy.sellpathOverview.projectNumber,
          projectTitle: copy.sellpathOverview.projectTitle,
          techStack: copy.sellpathOverview.techStack,
        }),
    },
    {
      id: "slide-13",
      title: copy.sellpathDetail1.title,
      render: (context) =>
        renderProjectImageDetailSlide(context, {
          copyClassName: "details-copy--large-text",
          descriptions: copy.sellpathDetail1.descriptions,
          detailTitle: copy.sellpathDetail1.detailTitle,
          imageAlt: copy.sellpathDetail1.imageAlt,
          imageClassName: "sellpath-detail1-image",
          imageSlotClassName: "sellpath-detail1-slot",
          imageSide: "right",
          imageSrc: "/images/sellpath_detail1.png",
        }),
    },
    {
      id: "slide-14",
      title: copy.sellpathDetail2.title,
      render: (context) =>
        renderProjectImageDetailSlide(context, {
          copyClassName: "details-copy--large-text",
          descriptions: copy.sellpathDetail2.descriptions,
          detailTitle: copy.sellpathDetail2.detailTitle,
          imageAlt: copy.sellpathDetail2.imageAlt,
          imageClassName: "sellpath-detail2-image",
          imageSlotClassName: "sellpath-detail2-slot",
          imageSide: "left",
          imageSrc: "/images/sellpath_detail2.png",
        }),
    },
    {
      id: "slide-15",
      title: copy.contact.title,
      render: () => (
        <div className="slide-content outro-layout outro-layout--start-aligned">
          <h2 className="outro-title stagger-1">{copy.contact.outroTitle}</h2>
          <ul className="contact-links contact-links--stacked contact-links--left-aligned contact-links--bulleted stagger-2">
            {copy.contact.links.map((link) => {
              const isExternalLink = !link.href.startsWith("mailto:");

              return (
                <li key={link.label} className="contact-item contact-item--bulleted">
                  <a
                    href={link.href}
                    className="contact-link contact-link--compact"
                    target={isExternalLink ? "_blank" : undefined}
                    rel={isExternalLink ? "noreferrer" : undefined}
                  >
                    {`${link.label} : ${link.value}`}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      ),
    },
  ];
}

export const slides = getSlides("en");
