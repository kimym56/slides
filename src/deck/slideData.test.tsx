import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { getSlides } from "./slideData";

describe("slide deck data", () => {
  it("includes split DSSkills and Sellpath detail slides in order", () => {
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

  it("renders project detail image slides without the old placeholder-sized frame", () => {
    const slide = getSlides("en").find((entry) => entry.id === "slide-9");

    expect(slide).toBeDefined();

    render(<>{slide?.render({ isActive: true })}</>);

    const image = screen.getByAltText("DSSkills prompt engineering screenshot");
    const imageSlot = image.closest(".project-detail-image-slot");

    expect(imageSlot).not.toBeNull();
    expect(imageSlot).toHaveClass("project-detail-image-slot--intrinsic");
  });

  it("renders image detail slides with a lead line and bullet list", () => {
    const slide = getSlides("en").find((entry) => entry.id === "slide-12");

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

  it("renders the page curl slide with a lead line, bullet list, and linked reference", () => {
    const slide = getSlides("en").find((entry) => entry.id === "slide-4");

    expect(slide).toBeDefined();

    render(<>{slide?.render({ isActive: false })}</>);

    expect(
      screen.getByText(/The corner-peel effect used in iBooks and Apple Maps/i),
    ).toBeInTheDocument();

    const referenceLink = screen.getByRole("link", { name: "Minsang Choi" });

    expect(referenceLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/posts/minsangchoi_metalshader-activity-7431057118914490368-L5TN/",
    );
    expect(referenceLink).toHaveAttribute("target", "_blank");
    expect(referenceLink).toHaveAttribute("rel", "noreferrer");

    const lead = screen.getByText(
      /The corner-peel effect used in iBooks and Apple Maps/i,
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
      screen.getByText(/users can drag any corner to peel the page back/i),
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

    const introSlide = slides.find((entry) => entry.id === "slide-2");

    expect(introSlide).toBeDefined();

    render(<>{introSlide?.render({ isActive: true })}</>);

    expect(screen.getByText("안녕하세요")).toBeInTheDocument();
    expect(screen.getByText("경력")).toBeInTheDocument();
    expect(screen.getByAltText("김용민 프로필 사진")).toBeInTheDocument();
  });

  it("renders Korean Mimesis detail copy for the Korean locale", () => {
    const slide = getSlides("ko").find((entry) => entry.id === "slide-4");

    expect(slide).toBeDefined();

    render(<>{slide?.render({ isActive: false })}</>);

    expect(
      screen.getByText(/iBooks와 Apple Maps에서 사용된 코너 필 효과/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/페이지를 넘기듯 뒤집어 뒷면을 확인할 수 있습니다/i),
    ).toBeInTheDocument();
  });
});
