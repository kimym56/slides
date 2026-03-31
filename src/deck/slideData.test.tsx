import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { slides } from "./slideData";

describe("slide deck data", () => {
  it("includes split DSSkills and Sellpath detail slides in order", () => {
    expect(slides.map((slide) => slide.title)).toEqual([
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
    const slide = slides.find((entry) => entry.id === "slide-9");

    expect(slide).toBeDefined();

    render(<>{slide?.render({ isActive: true })}</>);

    const image = screen.getByAltText("DSSkills prompt engineering screenshot");
    const imageSlot = image.closest(".project-detail-image-slot");

    expect(imageSlot).not.toBeNull();
    expect(imageSlot).toHaveClass("project-detail-image-slot--intrinsic");
  });

  it("renders image detail slides with a lead line and bullet list", () => {
    const slide = slides.find((entry) => entry.id === "slide-12");

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
    const slide = slides.find((entry) => entry.id === "slide-4");

    expect(slide).toBeDefined();

    render(<>{slide?.render({ isActive: false })}</>);

    expect(
      screen.getByText(
        /the corner-peel effect used in iBooks and Apple Maps/i,
      ),
    ).toBeInTheDocument();

    const referenceLink = screen.getByRole("link", { name: "Minsang Choi" });

    expect(referenceLink).toHaveAttribute(
      "href",
      "https://www.linkedin.com/posts/minsangchoi_metalshader-activity-7431057118914490368-L5TN/",
    );
    expect(referenceLink).toHaveAttribute("target", "_blank");
    expect(referenceLink).toHaveAttribute("rel", "noreferrer");

    const lead = screen.getByText(
      /the corner-peel effect used in iBooks and Apple Maps/i,
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
});
