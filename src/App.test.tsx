import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

vi.mock("./deck/slideData", () => ({
  slides: [
    {
      id: "slide-1",
      render: () => <div>stub slide</div>,
      title: "Portfolio",
    },
    {
      id: "slide-2",
      render: () => <div>second slide</div>,
      title: "Second",
    },
  ],
}));

import App from "./App";

it("renders the first slide and deck chrome from the React shell", () => {
  render(<App />);

  expect(screen.getByText("stub slide")).toBeInTheDocument();
  expect(screen.getByText("Portfolio")).toBeInTheDocument();
  expect(screen.getByText("1 / 2")).toBeInTheDocument();
});
