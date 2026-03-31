import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";
import { slides } from "./deck/slideData";

vi.mock("./mimesis/PageCurlSlideDemo", () => ({
  default: () => <div>page-curl-demo</div>,
}));

vi.mock("./mimesis/WiperTypographySlideDemo", () => ({
  default: () => <div>wiper-demo</div>,
}));

vi.mock("./mimesis/BwCircleSlideDemo", () => ({
  default: () => <div>bw-demo</div>,
}));

vi.mock("./mimesis/StaggeredTextSlideDemo", () => ({
  default: () => <div>staggered-demo</div>,
}));

function expectActiveDetailSlideLayout({
  demoText,
  demoOnLeft,
}: {
  demoOnLeft: boolean;
  demoText: string;
}) {
  const activeSlide = document.querySelector(".slide.active");

  expect(activeSlide).not.toBeNull();

  const columns = activeSlide?.querySelectorAll(".details-column");
  expect(columns).toHaveLength(2);

  const leftColumn = columns?.[0];
  const rightColumn = columns?.[1];

  expect(leftColumn?.textContent?.includes(demoText) ?? false).toBe(demoOnLeft);
  expect(rightColumn?.textContent?.includes(demoText) ?? false).toBe(!demoOnLeft);
}

it("renders one mimesis demo per detail slide and mounts only the active implementation", () => {
  render(<App />);

  expect(document.querySelector("iframe")).toBeNull();
  expect(screen.queryByText("page-curl-demo")).not.toBeInTheDocument();
  expect(screen.getByText(`1 / ${slides.length}`)).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });

  expectActiveDetailSlideLayout({
    demoOnLeft: true,
    demoText: "page-curl-demo",
  });
  expect(screen.getByText("page-curl-demo")).toBeInTheDocument();
  expect(screen.queryByText("wiper-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("bw-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("staggered-demo")).not.toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowRight" });

  expectActiveDetailSlideLayout({
    demoOnLeft: false,
    demoText: "wiper-demo",
  });
  expect(screen.queryByText("page-curl-demo")).not.toBeInTheDocument();
  expect(screen.getByText("wiper-demo")).toBeInTheDocument();
  expect(screen.queryByText("bw-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("staggered-demo")).not.toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowRight" });

  expectActiveDetailSlideLayout({
    demoOnLeft: true,
    demoText: "bw-demo",
  });
  expect(screen.queryByText("page-curl-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("wiper-demo")).not.toBeInTheDocument();
  expect(screen.getByText("bw-demo")).toBeInTheDocument();
  expect(screen.queryByText("staggered-demo")).not.toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowRight" });

  expectActiveDetailSlideLayout({
    demoOnLeft: false,
    demoText: "staggered-demo",
  });
  expect(screen.queryByText("page-curl-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("wiper-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("bw-demo")).not.toBeInTheDocument();
  expect(screen.getByText("staggered-demo")).toBeInTheDocument();
});
