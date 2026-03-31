import { describe, expect, it } from "vitest";
import { parseYouTubeVideoId } from "./bwCircleYouTube";

describe("parseYouTubeVideoId", () => {
  it("extracts the video id from a youtube watch url", () => {
    expect(
      parseYouTubeVideoId(
        "https://www.youtube.com/watch?v=abc123XYZ09",
      ),
    ).toBe("abc123XYZ09");
  });

  it("extracts the video id from a youtu.be url", () => {
    expect(parseYouTubeVideoId("https://youtu.be/abc123XYZ09?t=30")).toBe(
      "abc123XYZ09",
    );
  });

  it("returns null for unsupported input", () => {
    expect(parseYouTubeVideoId("https://example.com/watch?v=abc123XYZ09")).toBe(
      null,
    );
    expect(parseYouTubeVideoId("not a url")).toBe(null);
  });
});
