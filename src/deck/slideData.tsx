import type { ReactNode } from "react";
import BwCircleSlideDemo from "../mimesis/BwCircleSlideDemo";
import PageCurlSlideDemo from "../mimesis/PageCurlSlideDemo";
import StaggeredTextSlideDemo from "../mimesis/StaggeredTextSlideDemo";
import WiperTypographySlideDemo from "../mimesis/WiperTypographySlideDemo";

interface SlideDefinition {
  id: string;
  render: (context: { isActive: boolean }) => ReactNode;
  title: string;
}

interface MimesisDetailSlideOptions {
  descriptions: ReactNode[];
  demoSide?: "left" | "right";
  detailTitle: string;
  renderDemo: () => ReactNode;
}

interface ProjectImageDetailSlideOptions {
  descriptions: ReactNode[];
  detailTitle: string;
  imageAlt: string;
  imageClassName?: string;
  imageSide?: "left" | "right";
  imageSlotClassName?: string;
  imageSrc: string;
}

function renderStructuredDetailsCopy(
  detailTitle: string,
  descriptions: ReactNode[],
) {
  const [leadDescription, ...bulletDescriptions] = descriptions;

  return (
    <div className="details-copy details-copy--structured">
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

function renderMimesisDetailSlide(
  { isActive }: { isActive: boolean },
  {
    descriptions,
    demoSide = "left",
    detailTitle,
    renderDemo,
  }: MimesisDetailSlideOptions,
) {
  const demo = (
    <div className="project-demo-slot">{isActive ? renderDemo() : null}</div>
  );
  const explanation = renderStructuredDetailsCopy(detailTitle, descriptions);

  return (
    <div className="slide-content project-details-layout project-details-layout--structured">
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
  const explanation = renderStructuredDetailsCopy(detailTitle, descriptions);

  return (
    <div className="slide-content project-details-layout project-details-layout--structured">
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

export const slides: SlideDefinition[] = [
  {
    id: "slide-1",
    title: "Portfolio",
    render: () => (
      <div className="hero-center-content">
        <h1 className="hero-title stagger-1">Portfolio</h1>
        <div className="hero-subtext stagger-2">
          <span>YongMin Kim, Design Engineer</span>
          <span>2026</span>
        </div>
      </div>
    ),
  },
  {
    id: "slide-2",
    title: "Introduction",
    render: () => (
      <div className="slide-content project-split-layout">
        <div className="intro-left-panel">
          <h2 className="intro-greeting stagger-1">Hello</h2>
          <p className="intro-sentence stagger-2">
            I am YongMin Kim, a Design Engineer dedicated to crafting 'optimal
            experiences' at the intersection of technology and design.
          </p>
          <div className="edu-experience stagger-3">
            <div className="resume-section">
              <h3>Experience</h3>
              <ul>
                <li>
                  <span>Sellpath.inc - Frontend Engineer</span>
                  <span className="date">24.02 - 26.01</span>
                </li>
              </ul>
            </div>
            <div className="resume-section">
              <h3>Education</h3>
              <ul>
                <li>
                  <span>Yonsei University - Bachelor of Computer Science</span>
                  <span className="date">20.03 - 23.08</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="intro-right-panel project-visual stagger-4">
          <img
            className="project-media"
            src="/images/profile.webp"
            alt="YongMin Kim"
          />
        </div>
      </div>
    ),
  },
  {
    id: "slide-3",
    title: "01 — Mimesis",
    render: () => (
      <div className="slide-content project-split-layout">
        <div className="project-info">
          <div className="project-header stagger-1">
            <span className="project-number">01</span>
            <h2 className="project-title">Mimesis</h2>
          </div>
          <h3 className="project-subtitle stagger-2">
            Interactive UI Recreation
          </h3>
          <p className="project-description stagger-3">
            A project focused on recreating interactive UIs and creative digital
            works, then extending them by applying different web technologies
            and reinterpretations.
          </p>
          <div className="project-features stagger-4">
            <h4>Key Features</h4>
            <ul>
              <li>3D rendering on the web</li>
              <li>Audio capture and analysis</li>
              <li>Framer Motion-based interactions</li>
            </ul>
          </div>
          <div className="tech-stack stagger-5">
            <span className="tag">Next.js</span>
            <span className="tag">React</span>
            <span className="tag">TypeScript</span>
            <span className="tag">Vite</span>
            <span className="tag">R3F</span>
            <span className="tag">Three.js</span>
            <span className="tag">Framer Motion</span>
            <span className="tag">Realtime-bpm-analyzer</span>
          </div>
        </div>
        <div className="project-visual stagger-6">
          <video className="project-media" autoPlay loop muted playsInline>
            <source src="/videos/mimesis_main.webm" type="video/webm" />
          </video>
        </div>
      </div>
    ),
  },
  {
    id: "slide-4",
    title: "01 — Mimesis Details",
    render: (context) =>
      renderMimesisDetailSlide(context, {
        descriptions: [
          "the corner-peel effect used in iBooks and Apple Maps.",
          "Users can drag any corner to peel the page back and reveal the reverse side.",
          <>
            Inspired by{" "}
            <a
              href="https://www.linkedin.com/posts/minsangchoi_metalshader-activity-7431057118914490368-L5TN/"
              target="_blank"
              rel="noreferrer"
            >
              Minsang Choi
            </a>
            .
          </>,
          "Rebuilt in R3F based on an original implementation created in iOS SwiftUI.",
        ],
        detailTitle:
          "An interactive recreation of the classic iOS page curl transition",
        demoSide: "left",
        renderDemo: () => <PageCurlSlideDemo />,
      }),
  },
  {
    id: "slide-5",
    title: "01 — Mimesis Details 2",
    render: (context) =>
      renderMimesisDetailSlide(context, {
        descriptions: [
          "A typography-based wipe simulation inspired by FFF, where a moving band mechanically reveals and transforms text in real time with cursor control.",
          <>
            Inspired by{" "}
            <a
              href="https://blog.cmiscm.com/?page_id=3023"
              target="_blank"
              rel="noreferrer"
            >
              Jongmin Kim
            </a>
          </>,
          "Recreated in R3F by combining the original HTML/CSS-based work with a Tesla 3D model.",
        ],
        detailTitle: "Wiper Typography",
        demoSide: "right",
        renderDemo: () => <WiperTypographySlideDemo />,
      }),
  },
  {
    id: "slide-6",
    title: "01 — Mimesis Details 3",
    render: (context) =>
      renderMimesisDetailSlide(context, {
        descriptions: [
          "A monochrome yin-yang playground recreating SABUM’s black and white circle study, featuring a secondary pseudo-sync mode driven by YouTube playback time.",
          <>
            Inspired by{" "}
            <a
              href="https://www.threads.com/@byunsabum/post/DTkg4CWkyVS"
              target="_blank"
              rel="noreferrer"
            >
              SABUM
            </a>
          </>,
          "Embedded YouTube and analyzed browser audio output to drive particle motion in real time.",
        ],
        detailTitle: "Black & White Circle",
        demoSide: "left",
        renderDemo: () => <BwCircleSlideDemo />,
      }),
  },
  {
    id: "slide-7",
    title: "01 — Mimesis Details 4",
    render: (context) =>
      renderMimesisDetailSlide(context, {
        descriptions: [
          "A CSS-first recreation of Rauno Freiberg’s staggered hover lettering, where each character flips through a soft 3D cascade on hover or press.",
          <>
            Inspired by{" "}
            <a
              href="https://x.com/raunofreiberg/status/1826969932099104959"
              target="_blank"
              rel="noreferrer"
            >
              Rauno Freiberg
            </a>
          </>,
          "Recreated a similar interaction using Framer Motion, with dynamic motion previews based on user text input and click interactions.",
        ],
        detailTitle: "Staggered Text",
        demoSide: "right",
        renderDemo: () => <StaggeredTextSlideDemo />,
      }),
  },
  {
    id: "slide-8",
    title: "02 — DSSkills",
    render: () => (
      <div className="slide-content project-split-layout">
        <div className="project-info">
          <div className="project-header stagger-1">
            <span className="project-number">02</span>
            <h2 className="project-title">DSSkills</h2>
          </div>
          <h3 className="project-subtitle stagger-2">
            Design System with Agent Skills
          </h3>
          <p className="project-description stagger-3">
            A playground for quickly applying trending agent skills to design
            system components and instantly previewing the results.
          </p>
          <div className="project-features stagger-4">
            <h4>Key Features</h4>
            <ul>
              <li>Generation powered by the OpenAI API</li>
              <li>Instant output preview</li>
              <li>Code copy functionality</li>
            </ul>
          </div>
          <div className="tech-stack stagger-5">
            <span className="tag">Next.js</span>
            <span className="tag">React</span>
            <span className="tag">TypeScript</span>
            <span className="tag">OpenAI API</span>
            <span className="tag">PostgresQL</span>
            <span className="tag">Prisma</span>
            <span className="tag">Tailwind CSS</span>
          </div>
        </div>
        <div className="project-visual stagger-6">
          <img
            className="project-media"
            src="/images/dsskills_main.png"
            alt="DSSkills project screenshot"
          />
        </div>
      </div>
    ),
  },
  {
    id: "slide-9",
    title: "02 — DSSkills Details",
    render: (context) =>
      renderProjectImageDetailSlide(context, {
        descriptions: [
          "Users can generate design system components by applying currently popular UI-related agent skills.",
          "Users can select both the target design system component and the skills to immediately see what kind of output is produced.",
        ],
        detailTitle: "Agent Skill Selection",
        imageAlt: "DSSkills prompt engineering screenshot",
        imageClassName: "dsskills-detail1-image",
        imageSlotClassName: "dsskills-detail1-slot",
        imageSrc: "/images/dsskills_detail1.png",
        imageSide: "right",
      }),
  },
  {
    id: "slide-10",
    title: "02 — DSSkills Details 2",
    render: (context) =>
      renderProjectImageDetailSlide(context, {
        descriptions: [
          "Generated results can be previewed immediately.",
          "Previous outputs can also be reviewed through the history view.",
        ],
        detailTitle: "Design System Component Output and Code",
        imageAlt: "DSSkills validation sandbox screenshot",
        imageClassName: "dsskills-detail2-image",
        imageSlotClassName: "dsskills-detail2-slot",
        imageSrc: "/images/dsskills_detail2.png",
        imageSide: "left",
      }),
  },
  {
    id: "slide-11",
    title: "03 — Sellpath",
    render: () => (
      <div className="slide-content project-split-layout">
        <div className="project-info">
          <div className="project-header stagger-1">
            <span className="project-number">03</span>
            <h2 className="project-title">Sellpath</h2>
          </div>
          <h3 className="project-subtitle stagger-2">
            Worked for 2 years as a Frontend Engineer.
          </h3>
          <p className="project-description stagger-3">
            Contributed to an AI agent-based CRM and sales platform for the U.S.
            market.
          </p>
          <div className="project-features stagger-4">
            <h4>Key Features</h4>
            <ul>
              <li>Sales dashboard</li>
              <li>Activity Modal</li>
              <li>CRM-integrated tables.</li>
            </ul>
          </div>
          <div className="tech-stack stagger-5">
            <span className="tag">Next.js</span>
            <span className="tag">React</span>
            <span className="tag">TypeScript</span>
            <span className="tag">OpenAI API</span>
            <span className="tag">WebSocket</span>
            <span className="tag">WebRTC</span>
          </div>
        </div>
        <div className="project-visual stagger-6">
          <img
            className="project-media sellpath-main-media"
            src="/images/sellpath_main.png"
            alt="Sellpath project screenshot"
          />
        </div>
      </div>
    ),
  },
  {
    id: "slide-12",
    title: "03 — Sellpath Details",
    render: (context) =>
      renderProjectImageDetailSlide(context, {
        descriptions: [
          "Left section of the Activity Modal",
          "A modal that brings together key features needed for sales workflows.",
          "Provides an at-a-glance view of customer context.",
          "Includes a data visualization summarizing customer engagement and sentiment, powered by real-time data and AI analysis.",
          "Designed to help sales teams quickly understand customer status and make informed decisions.",
        ],
        detailTitle: "Activity Modal",
        imageAlt: "Sellpath data visualization screenshot",
        imageClassName: "sellpath-detail1-image",
        imageSlotClassName: "sellpath-detail1-slot",
        imageSrc: "/images/sellpath_detail1.png",
        imageSide: "right",
      }),
  },
  {
    id: "slide-13",
    title: "03 — Sellpath Details 2",
    render: (context) =>
      renderProjectImageDetailSlide(context, {
        descriptions: [
          "Right section of the Activity Modal",
          "Supports real-time calls, transcription, and AI agent-powered reply suggestions.",
          "Designed to facilitate seamless communication and efficient sales workflows.",
          "Integrates real-time communication features like WebSocket and OpenAI API(STT) for a responsive user experience.",
        ],
        detailTitle: "Chat UI",
        imageAlt: "Sellpath backend integration screenshot",
        imageClassName: "sellpath-detail2-image",
        imageSlotClassName: "sellpath-detail2-slot",
        imageSrc: "/images/sellpath_detail2.png",
        imageSide: "left",
      }),
  },
  {
    id: "slide-14",
    title: "Contact",
    render: () => (
      <div className="slide-content">
        <h2 className="outro-title stagger-1">Thank you.</h2>
        <div className="contact-links stagger-2">
          <a href="#" className="contact-link">
            GitHub
          </a>
          <a href="#" className="contact-link">
            LinkedIn
          </a>
          <a href="mailto:hello@example.com" className="contact-link">
            Email
          </a>
        </div>
      </div>
    ),
  },
];
