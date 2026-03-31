// @vitest-environment node

import path from "node:path";
import viteConfig from "../vite.config";

function getConfig() {
  return typeof viteConfig === "function"
    ? viteConfig({
        command: "serve",
        mode: "development",
        isSsrBuild: false,
        isPreview: false,
      })
    : viteConfig;
}

function normalizeAlias(
  alias: NonNullable<ReturnType<typeof getConfig>["resolve"]>["alias"],
) {
  if (!alias) {
    return new Map<string, string>();
  }

  if (Array.isArray(alias)) {
    return new Map(
      alias
        .filter(
          (entry): entry is { find: string; replacement: string } =>
            typeof entry.find === "string" &&
            typeof entry.replacement === "string",
        )
        .map((entry) => [entry.find, entry.replacement]),
    );
  }

  return new Map(Object.entries(alias));
}

it("dedupes shared runtime packages for sibling mimesis source imports", () => {
  const config = getConfig();

  expect(config.resolve?.dedupe).toEqual(
    expect.arrayContaining([
      "react",
      "react-dom",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "framer-motion",
    ]),
  );
});

it("pins the shared runtime entrypoints to slides' node_modules", () => {
  const config = getConfig();
  const alias = normalizeAlias(config.resolve?.alias);
  const slidesNodeModules = path.resolve(process.cwd(), "node_modules");

  expect(alias.get("three")).toContain(path.join(slidesNodeModules, "three"));
  expect(alias.get("@react-three/fiber")).toContain(
    path.join(slidesNodeModules, "@react-three", "fiber"),
  );
  expect(alias.get("@react-three/drei")).toContain(
    path.join(slidesNodeModules, "@react-three", "drei"),
  );
  expect(alias.get("framer-motion")).toContain(
    path.join(slidesNodeModules, "framer-motion"),
  );
  expect(alias.get("react")).toContain(
    path.join(slidesNodeModules, "react"),
  );
  expect(alias.get("react-dom")).toContain(
    path.join(slidesNodeModules, "react-dom"),
  );
  expect(alias.get("react/jsx-runtime")).toBe(
    path.join(slidesNodeModules, "react", "jsx-runtime.js"),
  );
  expect(alias.get("react/jsx-dev-runtime")).toBe(
    path.join(slidesNodeModules, "react", "jsx-dev-runtime.js"),
  );
});
