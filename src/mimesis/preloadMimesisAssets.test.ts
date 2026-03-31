import { afterEach, beforeEach, expect, it, vi } from "vitest";

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it("preloads the fixed page curl texture and driver-view model only once", async () => {
  const fetchSpy = vi.fn(() =>
    Promise.resolve({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      ok: true,
    }),
  );
  const imageSources: string[] = [];

  class MockImage {
    set decoding(_: string) {}

    set src(value: string) {
      imageSources.push(value);
    }
  }

  vi.stubGlobal("fetch", fetchSpy);
  vi.stubGlobal("Image", MockImage);

  const {
    MIMESIS_DRIVER_VIEW_MODEL_PATH,
    MIMESIS_PAGE_CURL_TEXTURE_PATH,
    preloadMimesisSlideAssets,
  } = await import("./preloadMimesisAssets");

  preloadMimesisSlideAssets();
  preloadMimesisSlideAssets();
  await Promise.resolve();

  expect(imageSources).toEqual([MIMESIS_PAGE_CURL_TEXTURE_PATH]);
  expect(fetchSpy).toHaveBeenCalledTimes(1);
  expect(fetchSpy).toHaveBeenCalledWith(MIMESIS_DRIVER_VIEW_MODEL_PATH, {
    cache: "force-cache",
  });
});
