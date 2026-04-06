import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

async function expectActiveDetailSlideLayout({
  demoText,
  demoOnLeft,
}: {
  demoOnLeft: boolean;
  demoText: string;
}) {
  await waitFor(() => {
    const activeSlide = document.querySelector(".slide.active");

    expect(activeSlide).not.toBeNull();

    const columns = activeSlide?.querySelectorAll(".details-column");
    expect(columns).toHaveLength(2);

    const leftColumn = columns?.[0];
    const rightColumn = columns?.[1];

    expect(leftColumn?.textContent?.includes(demoText) ?? false).toBe(demoOnLeft);
    expect(rightColumn?.textContent?.includes(demoText) ?? false).toBe(!demoOnLeft);
  });
}

it("renders one mimesis demo per detail slide and mounts only the active implementation", async () => {
  window.history.replaceState({}, "", "/en");

  render(<App />);

  expect(document.querySelector("iframe")).toBeNull();
  expect(screen.queryByText("page-curl-demo")).not.toBeInTheDocument();
  expect(screen.getByText("1", { selector: "#slide-counter-current" })).toBeInTheDocument();
  expect(screen.getByText("/", { selector: "#slide-counter-divider" })).toBeInTheDocument();
  expect(
    screen.getByText(String(slides.length), { selector: "#slide-counter-total" }),
  ).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });

  expect(await screen.findByText("page-curl-demo")).toBeInTheDocument();
  await expectActiveDetailSlideLayout({
    demoOnLeft: true,
    demoText: "page-curl-demo",
  });
  expect(screen.queryByText("wiper-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("bw-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("staggered-demo")).not.toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowRight" });

  expect(await screen.findByText("wiper-demo")).toBeInTheDocument();
  await expectActiveDetailSlideLayout({
    demoOnLeft: false,
    demoText: "wiper-demo",
  });
  await waitFor(() => {
    expect(screen.queryByText("page-curl-demo")).not.toBeInTheDocument();
  });
  expect(screen.queryByText("bw-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("staggered-demo")).not.toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowRight" });

  expect(await screen.findByText("bw-demo")).toBeInTheDocument();
  await expectActiveDetailSlideLayout({
    demoOnLeft: true,
    demoText: "bw-demo",
  });
  expect(screen.queryByText("page-curl-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("wiper-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("staggered-demo")).not.toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowRight" });

  expect(await screen.findByText("staggered-demo")).toBeInTheDocument();
  await expectActiveDetailSlideLayout({
    demoOnLeft: false,
    demoText: "staggered-demo",
  });
  expect(screen.queryByText("page-curl-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("wiper-demo")).not.toBeInTheDocument();
  expect(screen.queryByText("bw-demo")).not.toBeInTheDocument();
});
