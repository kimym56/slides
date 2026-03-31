import { render } from "@testing-library/react";
import { vi } from "vitest";

const { preloadMimesisSlideAssets } = vi.hoisted(() => ({
  preloadMimesisSlideAssets: vi.fn(),
}));

vi.mock("./mimesis/preloadMimesisAssets", () => ({
  preloadMimesisSlideAssets,
}));

vi.mock("./deck/slideData", () => ({
  getSlides: () => [
    {
      id: "slide-1",
      render: () => <div>stub slide</div>,
      title: "Stub",
    },
  ],
}));

import App from "./App";

it("starts preloading the fixed Mimesis slide assets on app mount", () => {
  render(<App />);

  expect(preloadMimesisSlideAssets).toHaveBeenCalledTimes(1);
});
