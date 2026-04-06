import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import { getSlides } from "./deck/slideData";

it("shows locale toggle links on the first slide", () => {
  window.history.replaceState({}, "", "/en");

  render(<App />);

  expect(screen.getByText("/", { selector: ".locale-toggle-divider" })).toHaveClass(
    "locale-toggle-divider",
  );
  expect(screen.getByRole("link", { name: "EN" })).toHaveAttribute("href", "/en");
  expect(screen.getByRole("link", { name: "EN" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  expect(screen.getByRole("link", { name: "KR" })).toHaveAttribute("href", "/kr");
});

it("advances and rewinds slides with keyboard and updates the section label", () => {
  window.history.replaceState({}, "", "/en");

  render(<App />);

  fireEvent.keyDown(document, { key: "ArrowRight" });
  expect(screen.getByRole("button", { name: "Introduction" })).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowLeft" });
  expect(screen.getByRole("button", { name: "Portfolio" })).toBeInTheDocument();
});

it("shows Korean section labels when the pathname ends with /kr", () => {
  window.history.replaceState({}, "", "/kr");

  render(<App />);

  expect(screen.getByRole("button", { name: "포트폴리오" })).toBeInTheDocument();

  fireEvent.keyDown(document, { key: "ArrowRight" });

  expect(screen.getByRole("button", { name: "소개" })).toBeInTheDocument();
});

it("opens the footer slide list and jumps to the selected slide", () => {
  window.history.replaceState({}, "", "/en");

  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Portfolio" }));
  fireEvent.click(screen.getByRole("button", { name: /Introduction/i }));

  expect(screen.getByRole("button", { name: "Introduction" })).toBeInTheDocument();
});

it("swaps the page counter into an input and jumps to the requested page on enter", () => {
  window.history.replaceState({}, "", "/en");

  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Jump to page" }));

  const pageInput = screen.getByRole("textbox", { name: "Jump to page" });

  fireEvent.change(pageInput, { target: { value: "3" } });
  fireEvent.keyDown(pageInput, { key: "Enter" });

  expect(screen.getByRole("button", { name: "01 — Mimesis" })).toBeInTheDocument();
});

it("keeps the divider and total visible while editing only the current page number", () => {
  window.history.replaceState({}, "", "/en");

  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Jump to page" }));

  expect(screen.getByRole("textbox", { name: "Jump to page" })).toBeInTheDocument();
  expect(screen.getByText("/", { selector: "#slide-counter-divider" })).toBeInTheDocument();
  expect(
    screen.getByText(String(getSlides("en").length), { selector: "#slide-counter-total" }),
  ).toBeInTheDocument();
});

it("restores the page counter when page jump is cancelled with escape", () => {
  window.history.replaceState({}, "", "/en");

  render(<App />);

  fireEvent.click(screen.getByRole("button", { name: "Jump to page" }));

  const pageInput = screen.getByRole("textbox", { name: "Jump to page" });

  fireEvent.change(pageInput, { target: { value: "4" } });
  fireEvent.keyDown(pageInput, { key: "Escape" });

  expect(screen.getByRole("button", { name: "Portfolio" })).toBeInTheDocument();
  expect(screen.getByText("1", { selector: "#slide-counter-current" })).toBeInTheDocument();
  expect(screen.getByText("/", { selector: "#slide-counter-divider" })).toBeInTheDocument();
  expect(
    screen.getByText(String(getSlides("en").length), { selector: "#slide-counter-total" }),
  ).toBeInTheDocument();
});
