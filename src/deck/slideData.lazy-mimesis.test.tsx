import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const demoImportCounts = vi.hoisted(() => ({
  blackWhiteCircle: 0,
  pageCurl: 0,
  staggeredText: 0,
  wiperTypography: 0,
}));

vi.mock("../mimesis/PageCurlSlideDemo", () => {
  demoImportCounts.pageCurl += 1;

  return {
    default: () => <div>page-curl-demo</div>,
  };
});

vi.mock("../mimesis/WiperTypographySlideDemo", () => {
  demoImportCounts.wiperTypography += 1;

  return {
    default: () => <div>wiper-demo</div>,
  };
});

vi.mock("../mimesis/BwCircleSlideDemo", () => {
  demoImportCounts.blackWhiteCircle += 1;

  return {
    default: () => <div>bw-demo</div>,
  };
});

vi.mock("../mimesis/StaggeredTextSlideDemo", () => {
  demoImportCounts.staggeredText += 1;

  return {
    default: () => <div>staggered-demo</div>,
  };
});

it("defers loading mimesis demos until an active detail slide renders them", async () => {
  const { getSlides } = await import("./slideData");

  expect(demoImportCounts).toEqual({
    blackWhiteCircle: 0,
    pageCurl: 0,
    staggeredText: 0,
    wiperTypography: 0,
  });

  const pageCurlSlide = getSlides("en").find((slide) => slide.id === "slide-5");

  expect(pageCurlSlide).toBeDefined();

  const { rerender } = render(<>{pageCurlSlide?.render({ isActive: false })}</>);

  expect(screen.queryByText("page-curl-demo")).not.toBeInTheDocument();
  expect(demoImportCounts.pageCurl).toBe(0);

  rerender(<>{pageCurlSlide?.render({ isActive: true })}</>);

  expect(await screen.findByText("page-curl-demo")).toBeInTheDocument();
  expect(demoImportCounts).toEqual({
    blackWhiteCircle: 0,
    pageCurl: 1,
    staggeredText: 0,
    wiperTypography: 0,
  });
});
