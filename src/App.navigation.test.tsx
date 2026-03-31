import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

it("advances and rewinds slides with keyboard and updates the section label", () => {
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
