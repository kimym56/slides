import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getSlides } from "./slideData";

describe("slide deck data", () => {
  it("includes split DSSkills and Sellpath detail slides in order without the old interactive slide", () => {
    expect(getSlides("en").map((slide) => slide.title)).toEqual([
      "Portfolio",
      "Introduction",
      "01 — Mimesis",
      "01 — Mimesis Details",
      "01 — Mimesis Details 2",
      "01 — Mimesis Details 3",
      "01 — Mimesis Details 4",
      "02 — DSSkills",
      "02 — DSSkills Details",
      "02 — DSSkills Details 2",
      "03 — Sellpath",
      "03 — Sellpath Details",
      "03 — Sellpath Details 2",
      "Contact",
    ]);
  });

  it("renders linked project URLs on the overview slides", () => {
    const overviewSlides = [
      {
        id: "slide-4",
        url: "https://ymkim-mimesis.vercel.app",
      },
      {
        id: "slide-9",
        url: "https://ymkim-dsskills.vercel.app",
      },
      {
        id: "slide-12",
        url: "https://www.sellpath.ai",
      },
    ];

    for (const overviewSlide of overviewSlides) {
      const slide = getSlides("en").find((entry) => entry.id === overviewSlide.id);

      expect(slide).toBeDefined();

      const { unmount } = render(<>{slide?.render({ isActive: true })}</>);

      expect(
        screen.getByRole("link", {
          name: overviewSlide.url,
        }),
      ).toHaveAttribute("href", overviewSlide.url);

      unmount();
    }
  });

  it("renders project detail image slides without the old placeholder-sized frame", () => {
    const slide = getSlides("en").find((entry) => entry.id === "slide-10");

    expect(slide).toBeDefined();

    render(<>{slide?.render({ isActive: true })}</>);

    const image = screen.getByAltText("DSSkills prompt engineering screenshot");
    const imageSlot = image.closest(".project-detail-image-slot");

    expect(imageSlot).not.toBeNull();
    expect(imageSlot).toHaveClass("project-detail-image-slot--intrinsic");
  });

  it("marks the requested detail slides to center their content within the layout", () => {
    const centeredDetailSlideIds = [
      "slide-10",
      "slide-11",
      "slide-13",
      "slide-14",
      "slide-5",
      "slide-6",
      "slide-7",
      "slide-8",
    ];

    for (const slideId of centeredDetailSlideIds) {
      const slide = getSlides("en").find((entry) => entry.id === slideId);

      expect(slide).toBeDefined();

      const { container, unmount } = render(
        <>{slide?.render({ isActive: false })}</>,
      );

      expect(container.firstElementChild).toHaveClass(
        "project-details-layout--content-centered",
      );

      unmount();
    }
  });

  it("applies the larger text treatment to the requested detail slides", () => {
    const largerTextSlideIds = [
      "slide-5",
      "slide-6",
      "slide-7",
      "slide-8",
      "slide-10",
      "slide-11",
      "slide-13",
      "slide-14",
    ];

    for (const slideId of largerTextSlideIds) {
      const slide = getSlides("en").find((entry) => entry.id === slideId);

      expect(slide).toBeDefined();

      const { container, unmount } = render(
        <>{slide?.render({ isActive: false })}</>,
      );

      expect(container.querySelector(".details-copy")).toHaveClass(
        "details-copy--large-text",
      );

      unmount();
    }
  });

  it("renders image detail slides with a lead line and bullet list", () => {
    const slide = getSlides("en").find((entry) => entry.id === "slide-13");

    expect(slide).toBeDefined();

    render(<>{slide?.render({ isActive: true })}</>);

    const lead = screen.getByText("Left section of the Activity Modal");
    const bulletList = screen.getByRole("list");
    const bulletItems = screen.getAllByRole("listitem");

    expect(lead).toHaveClass("details-lead");
    expect(bulletList).toHaveClass("details-list");
    expect(bulletItems).toHaveLength(4);
    expect(
      screen.getByText(/designed to help sales teams quickly understand/i),
    ).toBeInTheDocument();
  });

  it("renders synced English DSSkills detail copy", () => {
    const detailSlide1 = getSlides("en").find((entry) => entry.id === "slide-10");

    expect(detailSlide1).toBeDefined();

    const { unmount } = render(<>{detailSlide1?.render({ isActive: true })}</>);

    expect(screen.getByText("Agent Skill Selection")).toBeInTheDocument();
    expect(
      screen.getByText(/GitHub star counts and descriptions/i),
    ).toBeInTheDocument();

    unmount();

    const detailSlide2 = getSlides("en").find((entry) => entry.id === "slide-11");

    expect(detailSlide2).toBeDefined();

    render(<>{detailSlide2?.render({ isActive: true })}</>);

    expect(screen.getByText("Design System Component")).toBeInTheDocument();
    expect(
      screen.getByText(/generated outputs are also provided as code/i),
    ).toBeInTheDocument();
  });

  it("renders the page curl slide with a lead line, bullet list, and linked reference", () => {
    const slide = getSlides("en").find((entry) => entry.id === "slide-5");

    expect(slide).toBeDefined();

    render(<>{slide?.render({ isActive: false })}</>);

    expect(screen.getByText("iOS Page Curl Effect")).toBeInTheDocument();
    expect(
      screen.getByText(/recreated the Page Curl effect used in iBooks and Apple Maps/i),
    ).toBeInTheDocument();

    const referenceLink = screen.getByRole("link", { name: "Minsang Choi" });

    expect(referenceLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/posts/minsangchoi_metalshader-activity-7431057118914490368-L5TN/",
    );
    expect(referenceLink).toHaveClass("reference-link");
    expect(referenceLink).toHaveAttribute("target", "_blank");
    expect(referenceLink).toHaveAttribute("rel", "noreferrer");

    const lead = screen.getByText(
      /recreated the Page Curl effect used in iBooks and Apple Maps/i,
    );
    const bulletList = screen.getByRole("list");
    const bulletItems = screen.getAllByRole("listitem");

    expect(lead).toHaveClass("details-lead");
    expect(bulletList).toHaveClass("details-list");
    expect(bulletItems).toHaveLength(3);
    expect(
      screen.getByText(/original implementation created in iOS SwiftUI/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/users can drag any corner and flip the page as if turning it/i),
    ).toBeInTheDocument();
  });

  it("renders synced English copy for the later Mimesis detail slides", () => {
    const blackWhiteCircleSlide = getSlides("en").find((entry) => entry.id === "slide-7");

    expect(blackWhiteCircleSlide).toBeDefined();

    const { unmount } = render(
      <>{blackWhiteCircleSlide?.render({ isActive: false })}</>,
    );

    expect(
      screen.getByText(/Yin and Yang Dynamics project/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Because YouTube policy prevents direct audio extraction/i),
    ).toBeInTheDocument();

    unmount();

    const staggeredTextSlide = getSlides("en").find((entry) => entry.id === "slide-8");

    expect(staggeredTextSlide).toBeDefined();

    render(<>{staggeredTextSlide?.render({ isActive: false })}</>);

    expect(
      screen.getByText(/text interaction that uses staggered motion/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/dynamic motion previews based on user text input and click interactions/i),
    ).toBeInTheDocument();
  });

  it("returns Korean slide titles and translated copy for the Korean locale", () => {
    const slides = getSlides("ko");

    expect(slides.map((slide) => slide.title)).toEqual([
      "포트폴리오",
      "소개",
      "01 — Mimesis",
      "01 — Mimesis 상세",
      "01 — Mimesis 상세 2",
      "01 — Mimesis 상세 3",
      "01 — Mimesis 상세 4",
      "02 — DSSkills",
      "02 — DSSkills 상세",
      "02 — DSSkills 상세 2",
      "03 — Sellpath",
      "03 — Sellpath 상세",
      "03 — Sellpath 상세 2",
      "연락처",
    ]);
  });

  it("renders linked project URLs on the Korean overview slides", () => {
    const overviewSlides = [
      {
        id: "slide-4",
        url: "https://ymkim-mimesis.vercel.app",
      },
      {
        id: "slide-9",
        url: "https://ymkim-dsskills.vercel.app",
      },
      {
        id: "slide-12",
        url: "https://www.sellpath.ai",
      },
    ];

    for (const overviewSlide of overviewSlides) {
      const slide = getSlides("ko").find((entry) => entry.id === overviewSlide.id);

      expect(slide).toBeDefined();

      const { unmount } = render(<>{slide?.render({ isActive: true })}</>);

      expect(
        screen.getByRole("link", {
          name: overviewSlide.url,
        }),
      ).toHaveAttribute("href", overviewSlide.url);

      unmount();
    }
  });

  it("renders the Korean introduction slide in the second position", () => {
    const introSlide = getSlides("ko")[1];

    expect(introSlide).toBeDefined();

    render(<>{introSlide?.render({ isActive: true })}</>);

    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
    expect(screen.getByText("경력")).toBeInTheDocument();
    expect(screen.getByAltText("김용민 프로필 사진")).toBeInTheDocument();
  });

  it("renders Korean Mimesis detail copy for the Korean locale", () => {
    const slide = getSlides("ko").find((entry) => entry.id === "slide-5");

    expect(slide).toBeDefined();

    render(<>{slide?.render({ isActive: false })}</>);

    expect(
      screen.getByText(/iBooks와 Apple Maps에서 사용된 Page Curl 효과/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/페이지를 넘기듯 뒤집으며 뒷면을 확인할 수 있습니다/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Minsang Choi" })).toHaveClass(
      "reference-link",
    );
  });

  it("renders the Korean outro slide as a centered vertical contact list", () => {
    const slide = getSlides("ko").find((entry) => entry.id === "slide-15");

    expect(slide).toBeDefined();

    const { container } = render(<>{slide?.render({ isActive: false })}</>);

    expect(container.firstElementChild).toHaveClass(
      "outro-layout",
      "outro-layout--start-aligned",
    );
    expect(
      screen.getByRole("heading", { name: "감사합니다." }),
    ).toBeInTheDocument();

    const contactList = screen.getByRole("list");

    expect(contactList).toHaveClass(
      "contact-links",
      "contact-links--stacked",
      "contact-links--left-aligned",
      "contact-links--bulleted",
    );
    const contactItems = screen.getAllByRole("listitem");

    expect(contactItems).toHaveLength(4);
    expect(contactItems[0]).toHaveClass(
      "contact-item",
      "contact-item--bulleted",
    );

    expect(
      screen.getByRole("link", {
        name: "이메일 : kimym.svb@gmail.com",
      }),
    ).toHaveClass("contact-link", "contact-link--compact");
    expect(
      screen.getByRole("link", {
        name: "이메일 : kimym.svb@gmail.com",
      }),
    ).toHaveAttribute("href", "mailto:kimym.svb@gmail.com");
    expect(
      screen.getByRole("link", {
        name: "링크드인 : https://www.linkedin.com/in/kimym56/",
      }),
    ).toHaveAttribute("href", "https://www.linkedin.com/in/kimym56/");
    expect(
      screen.getByRole("link", {
        name: "깃허브 : https://github.com/kimym56",
      }),
    ).toHaveAttribute("href", "https://github.com/kimym56");
    expect(
      screen.getByRole("link", {
        name: "웹사이트 : https://ymkim-portfolio.vercel.app",
      }),
    ).toHaveAttribute("href", "https://ymkim-portfolio.vercel.app");
  });
});
