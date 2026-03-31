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
  description: string;
  demoSide?: "left" | "right";
  detailTitle: string;
  renderDemo: () => ReactNode;
}

function renderMimesisDetailSlide(
  { isActive }: { isActive: boolean },
  {
    description,
    demoSide = "left",
    detailTitle,
    renderDemo,
  }: MimesisDetailSlideOptions,
) {
  const demo = (
    <div className="project-demo-slot">
      {isActive ? renderDemo() : null}
    </div>
  );
  const explanation = (
    <>
      <h3 className="details-title">{detailTitle}</h3>
      <p className="details-text">{description}</p>
    </>
  );

  return (
    <div className="slide-content project-details-layout">
      <div className="details-column stagger-1">
        {demoSide === "left" ? demo : explanation}
      </div>
      <div className="details-column stagger-2">
        {demoSide === "left" ? explanation : demo}
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
            I am YongMin Kim, a design engineer merging aesthetic intuition and
            structural logic.
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
          <h3 className="project-subtitle stagger-2">Reimplement Interactive UI</h3>
          <p className="project-description stagger-3">
            An exploration of interactive design systems and cohesive user
            experiences built on top of modern React meta-frameworks.
          </p>
          <div className="project-features stagger-4">
            <h4>Key Features</h4>
            <ul>
              <li>Modular Component Architecture</li>
              <li>Advanced Motion Animations</li>
              <li>Accessible UI Patterns</li>
            </ul>
          </div>
          <div className="tech-stack stagger-5">
            <span className="tag">Next.js</span>
            <span className="tag">React</span>
            <span className="tag">TypeScript</span>
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
        description:
          "Brief explanation of the architecture, focusing on component reusability and logic.",
        detailTitle: "System Architecture",
        demoSide: "left",
        renderDemo: () => <PageCurlSlideDemo />,
      }),
  },
  {
    id: "slide-5",
    title: "01 — Mimesis Details 2",
    render: (context) =>
      renderMimesisDetailSlide(context, {
        description:
          "Detailing the interactive states and patterns implemented.",
        detailTitle: "Interactive Components",
        demoSide: "right",
        renderDemo: () => <WiperTypographySlideDemo />,
      }),
  },
  {
    id: "slide-6",
    title: "01 — Mimesis Details 3",
    render: (context) =>
      renderMimesisDetailSlide(context, {
        description: "Handling complex component states seamlessly.",
        detailTitle: "State Management",
        demoSide: "left",
        renderDemo: () => <BwCircleSlideDemo />,
      }),
  },
  {
    id: "slide-7",
    title: "01 — Mimesis Details 4",
    render: (context) =>
      renderMimesisDetailSlide(context, {
        description:
          "Implementation details for spring-based fluid motions.",
        detailTitle: "Animation Tactics",
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
            A design system playground for quickly validating the UI
            implementation with agent skills.
          </p>
          <div className="project-features stagger-4">
            <h4>Key Features</h4>
            <ul>
              <li>Agent Pattern Testing</li>
              <li>Rapid UI Validation</li>
              <li>Constraint-Based Approach</li>
            </ul>
          </div>
          <div className="tech-stack stagger-5">
            <span className="tag">LLM Agents</span>
            <span className="tag">Design System</span>
            <span className="tag">Validation</span>
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
    render: () => (
      <div className="slide-content project-details-layout">
        <div className="details-column stagger-1">
          <h3 className="details-title">Prompt Engineering</h3>
          <p className="details-text">
            Structuring constraints for agent-driven design execution.
          </p>
          <div className="project-image-placeholder empty-box mt-2">
            <span>Details Image 1</span>
          </div>
        </div>
        <div className="details-column stagger-2">
          <div className="project-image-placeholder empty-box mb-2">
            <span>Details Image 2</span>
          </div>
          <h3 className="details-title">Validation Sandbox</h3>
          <p className="details-text">
            Scalable environment testing UI changes in real-time.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "slide-10",
    title: "03 — Sellpath",
    render: () => (
      <div className="slide-content project-split-layout">
        <div className="project-info">
          <div className="project-header stagger-1">
            <span className="project-number">03</span>
            <h2 className="project-title">Sellpath</h2>
          </div>
          <h3 className="project-subtitle stagger-2">B2B SaaS Platform</h3>
          <p className="project-description stagger-3">
            A robust SaaS platform. Combines a complex Python backend
            infrastructure with a highly responsive TypeScript-driven UI.
          </p>
          <div className="project-features stagger-4">
            <h4>Key Features</h4>
            <ul>
              <li>Complex Data Visualization</li>
              <li>Real-time AI Processing</li>
              <li>Scalable Microservices</li>
            </ul>
          </div>
          <div className="tech-stack stagger-5">
            <span className="tag">Python</span>
            <span className="tag">Docker</span>
            <span className="tag">React/TS</span>
            <span className="tag">AI</span>
          </div>
        </div>
        <div className="project-visual stagger-6">
          <div className="project-image-placeholder empty-box">
            <span>Empty Image Area</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "slide-11",
    title: "03 — Sellpath Details",
    render: () => (
      <div className="slide-content project-details-layout">
        <div className="details-column stagger-1">
          <h3 className="details-title">Data Visualization</h3>
          <p className="details-text">
            Handling complex data streams with responsive charting components.
          </p>
          <div className="project-image-placeholder empty-box mt-2">
            <span>Details Image 1</span>
          </div>
        </div>
        <div className="details-column stagger-2">
          <div className="project-image-placeholder empty-box mb-2">
            <span>Details Image 2</span>
          </div>
          <h3 className="details-title">Backend Integration</h3>
          <p className="details-text">
            Seamless communication between the TypeScript UI and Python backend.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: "slide-12",
    title: "Contact",
    render: () => (
      <div className="slide-content">
        <h2 className="outro-title stagger-1">Let&apos;s build together.</h2>
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
