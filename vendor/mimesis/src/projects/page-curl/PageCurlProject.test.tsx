// @vitest-environment jsdom

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import PageCurlProject from "./PageCurlProject";

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const { pageCurlEmbed3DSpy } = vi.hoisted(() => ({
  pageCurlEmbed3DSpy: vi.fn(() => <div>mock-3d-shader</div>),
}));

vi.mock("./PageCurlEmbed", () => ({
  default: () => <div>mock-2d-canvas</div>,
}));

vi.mock("./PageCurlEmbed3D", () => ({
  default: pageCurlEmbed3DSpy,
}));

describe("PageCurlProject", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    pageCurlEmbed3DSpy.mockClear();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("renders 2d canvas by default and switches to 3d shader on demand", () => {
    act(() => {
      root.render(<PageCurlProject projectId="ios-curl-animation" />);
    });

    expect(container.textContent).toContain("mock-2d-canvas");
    expect(container.textContent).not.toContain("mock-3d-shader");

    act(() => {
      container
        .querySelectorAll("button")[1]
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("mock-3d-shader");
  });

  it("starts in 3d shader mode when initialMode requests it", () => {
    act(() => {
      root.render(
        <PageCurlProject
          initialMode="3d"
          projectId="ios-curl-animation"
        />,
      );
    });

    expect(container.textContent).toContain("mock-3d-shader");
    expect(container.textContent).not.toContain("mock-2d-canvas");
  });

  it("hides the mode toggle when controls are disabled", () => {
    act(() => {
      root.render(
        <PageCurlProject
          hideControls
          initialMode="3d"
          projectId="ios-curl-animation"
        />,
      );
    });

    expect(container.textContent).toContain("mock-3d-shader");
    expect(container.textContent).not.toContain("2D Canvas");
    expect(container.textContent).not.toContain("3D Shader");
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });

  it("passes hidden controls through to the 3d embed", () => {
    act(() => {
      root.render(
        <PageCurlProject
          hideControls
          initialMode="3d"
          projectId="ios-curl-animation"
        />,
      );
    });

    expect(pageCurlEmbed3DSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        hideControls: true,
      }),
      undefined,
    );
  });
});
