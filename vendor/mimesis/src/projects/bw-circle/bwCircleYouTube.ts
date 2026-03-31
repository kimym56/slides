const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

function normalizeVideoId(candidate: string | null | undefined) {
  if (!candidate) {
    return null;
  }

  return /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null;
}

export function parseYouTubeVideoId(input: string) {
  try {
    const url = new URL(input);

    if (!YOUTUBE_HOSTS.has(url.hostname)) {
      return null;
    }

    if (url.hostname.endsWith("youtu.be")) {
      return normalizeVideoId(url.pathname.split("/").filter(Boolean)[0]);
    }

    if (url.pathname === "/watch") {
      return normalizeVideoId(url.searchParams.get("v"));
    }

    if (url.pathname.startsWith("/embed/")) {
      return normalizeVideoId(url.pathname.split("/")[2]);
    }

    if (url.pathname.startsWith("/shorts/")) {
      return normalizeVideoId(url.pathname.split("/")[2]);
    }

    return null;
  } catch {
    return null;
  }
}
