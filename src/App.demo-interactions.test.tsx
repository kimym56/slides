import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import App from "./App";

const { DemoFrame } = vi.hoisted(() => ({
  DemoFrame: () => (
    <div
      data-demo-interaction-zone
      data-testid="mimesis-demo-frame"
      tabIndex={0}
    >
      demo-frame
    </div>
  ),
}));

vi.mock("./mimesis/PageCurlSlideDemo", () => ({
  default: DemoFrame,
}));

vi.mock("./mimesis/WiperTypographySlideDemo", () => ({
  default: DemoFrame,
}));

vi.mock("./mimesis/BwCircleSlideDemo", () => ({
  default: DemoFrame,
}));

vi.mock("./mimesis/StaggeredTextSlideDemo", () => ({
  default: DemoFrame,
}));

it("advances slides on wheel outside demo zones", () => {
  window.history.replaceState({}, "", "/en");

  render(<App />);

  fireEvent.wheel(document.body, { deltaY: 100 });

  expect(
    screen.getByText("Introduction", { selector: "#current-section" }),
  ).toBeInTheDocument();
});

it("ignores demo-local wheel and keyboard events", async () => {
  window.history.replaceState({}, "", "/en");

  render(<App />);

  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });

  const demoZone = await screen.findByTestId("mimesis-demo-frame");

  fireEvent.wheel(demoZone, { deltaY: 100 });
  expect(
    screen.getByText("01 — Mimesis Details", { selector: "#current-section" }),
  ).toBeInTheDocument();

  fireEvent.keyDown(demoZone, { key: "ArrowRight" });
  expect(
    screen.getByText("01 — Mimesis Details", { selector: "#current-section" }),
  ).toBeInTheDocument();
});

it("keeps demo-local navigation blocked across consecutive mimesis detail slides", async () => {
  window.history.replaceState({}, "", "/en");

  render(<App />);

  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });
  fireEvent.keyDown(document, { key: "ArrowRight" });

  expect(
    screen.getByText("01 — Mimesis Details 2", { selector: "#current-section" }),
  ).toBeInTheDocument();

  const demoZone = await screen.findByTestId("mimesis-demo-frame");

  fireEvent.wheel(demoZone, { deltaY: 100 });
  fireEvent.keyDown(demoZone, { key: "ArrowRight" });

  expect(
    screen.getByText("01 — Mimesis Details 2", { selector: "#current-section" }),
  ).toBeInTheDocument();
});
