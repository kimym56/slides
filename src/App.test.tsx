import { render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("./deck/slideData", () => ({
  getSlides: (locale: "en" | "ko") => [
    {
      id: "slide-1",
      render: () => <div>{locale === "ko" ? "테스트 슬라이드" : "stub slide"}</div>,
      title: locale === "ko" ? "포트폴리오" : "Portfolio",
    },
    {
      id: "slide-2",
      render: () => <div>{locale === "ko" ? "두 번째 슬라이드" : "second slide"}</div>,
      title: locale === "ko" ? "두 번째" : "Second",
    },
  ],
}));

import App from "./App";

function mockNavigatorLanguages(languages: string[]) {
  Object.defineProperty(window.navigator, "languages", {
    configurable: true,
    value: languages,
  });
}

it("renders the first slide and deck chrome from the React shell on /en", () => {
  window.history.replaceState({}, "", "/en");

  render(<App />);

  expect(screen.getByText("stub slide")).toBeInTheDocument();
  expect(screen.getByText("Portfolio")).toBeInTheDocument();
  expect(screen.getByText("1", { selector: "#slide-counter-current" })).toBeInTheDocument();
  expect(screen.getByText("/", { selector: "#slide-counter-divider" })).toBeInTheDocument();
  expect(screen.getByText("2", { selector: "#slide-counter-total" })).toBeInTheDocument();
});

it("renders Korean deck chrome when pathname ends with /kr", () => {
  window.history.replaceState({}, "", "/kr");

  render(<App />);

  expect(screen.getByText("테스트 슬라이드")).toBeInTheDocument();
  expect(screen.getByText("포트폴리오")).toBeInTheDocument();
  expect(screen.getByLabelText("이전 슬라이드")).toBeInTheDocument();
  expect(screen.getByLabelText("다음 슬라이드")).toBeInTheDocument();
  expect(screen.getByText(/다음/)).toBeInTheDocument();
});

it("redirects / to /kr when the browser prefers Korean", async () => {
  mockNavigatorLanguages(["ko-KR", "en-US"]);
  window.history.replaceState({}, "", "/");

  render(<App />);

  await waitFor(() => {
    expect(window.location.pathname).toBe("/kr");
  });
  expect(screen.getByText("테스트 슬라이드")).toBeInTheDocument();
});

it("redirects / to /en when the browser does not prefer Korean", async () => {
  mockNavigatorLanguages(["en-US"]);
  window.history.replaceState({}, "", "/");

  render(<App />);

  await waitFor(() => {
    expect(window.location.pathname).toBe("/en");
  });
  expect(screen.getByText("stub slide")).toBeInTheDocument();
});

it("renders all Korean slides and hides deck chrome in pdf export mode", () => {
  window.history.replaceState({}, "", "/kr?export=pdf");

  render(<App />);

  expect(screen.getByText("테스트 슬라이드")).toBeInTheDocument();
  expect(screen.getByText("두 번째 슬라이드")).toBeInTheDocument();
  expect(screen.queryByLabelText("이전 슬라이드")).not.toBeInTheDocument();
  expect(screen.queryByLabelText("다음 슬라이드")).not.toBeInTheDocument();
  expect(screen.queryByText("1", { selector: "#slide-counter-current" })).not.toBeInTheDocument();
});
