export const MIMESIS_PAGE_CURL_TEXTURE_PATH = "/images/love-jones-cover.jpg";
export const MIMESIS_DRIVER_VIEW_MODEL_PATH = "/models/tesla_2018_model_3.glb";

let didStartMimesisAssetPreload = false;

function preloadImage(src: string) {
  if (typeof Image === "undefined") {
    return;
  }

  const image = new Image();
  image.decoding = "async";
  image.src = src;
}

async function preloadBinary(url: string) {
  if (typeof fetch !== "function") {
    return;
  }

  const response = await fetch(url, {
    cache: "force-cache",
  });

  if (!response.ok) {
    return;
  }

  await response.arrayBuffer();
}

export function preloadMimesisSlideAssets() {
  if (didStartMimesisAssetPreload) {
    return;
  }

  didStartMimesisAssetPreload = true;
  preloadImage(MIMESIS_PAGE_CURL_TEXTURE_PATH);
  void preloadBinary(MIMESIS_DRIVER_VIEW_MODEL_PATH).catch(() => {});
}
