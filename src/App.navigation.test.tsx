import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

it("advances and rewinds slides with keyboard and updates the section label", () => {
  window.history.replaceState({}, "", "/");

  render(<App />);

  fireEvent.keyDown(document, { key: "ArrowRight" });
  expect(
    screen.getByText("Introduction", { selector: "#current-section" }),
  ).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowLeft" });
  expect(
    screen.getByText("Portfolio", { selector: "#current-section" }),
  ).toBeInTheDocument();
});

it("shows Korean section labels when the pathname ends with /kr", () => {
  window.history.replaceState({}, "", "/kr");

  render(<App />);

  expect(
    screen.getByText("포트폴리오", { selector: "#current-section" }),
  ).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowRight" });

  expect(
    screen.getByText("소개", { selector: "#current-section" }),
  ).toBeInTheDocument();
});
