import path from "node:path";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";

const slidesNodeModules = path.resolve(__dirname, "./node_modules");
const siblingMimesisSourceRoot = path.resolve(__dirname, "../mimesis/src");
const vendoredMimesisSourceRoot = path.resolve(__dirname, "./vendor/mimesis/src");

export function resolveMimesisSourceRoot(
  siblingCheckoutAvailable = existsSync(siblingMimesisSourceRoot),
) {
  return siblingCheckoutAvailable
    ? siblingMimesisSourceRoot
    : vendoredMimesisSourceRoot;
}

function emitStaticLocaleEntryHtml(localeEntries = ["en", "kr"]) {
  let rootDir = __dirname;
  let buildOutDir = "dist";

  return {
    name: "emit-static-locale-entry-html",
    apply: "build" as const,
    configResolved(config: { root: string; build: { outDir: string } }) {
      rootDir = config.root;
      buildOutDir = config.build.outDir;
    },
    closeBundle() {
      const distRoot = path.resolve(rootDir, buildOutDir);
      const sourceIndexPath = path.join(distRoot, "index.html");

      if (!existsSync(sourceIndexPath)) {
        return;
      }

      const sourceIndexHtml = readFileSync(sourceIndexPath, "utf8");

      for (const localeEntry of localeEntries) {
        const localeIndexPath = path.join(distRoot, localeEntry, "index.html");
        mkdirSync(path.dirname(localeIndexPath), { recursive: true });
        writeFileSync(localeIndexPath, sourceIndexHtml, "utf8");
      }
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), emitStaticLocaleEntryHtml()],
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "framer-motion",
    ],
    alias: {
      "@mimesis": resolveMimesisSourceRoot(),
      "@slides": path.resolve(__dirname, "./src"),
      three: path.join(slidesNodeModules, "three"),
      "@react-three/fiber": path.join(
        slidesNodeModules,
        "@react-three",
        "fiber",
      ),
      "@react-three/drei": path.join(
        slidesNodeModules,
        "@react-three",
        "drei",
      ),
      "framer-motion": path.join(slidesNodeModules, "framer-motion"),
      react: path.join(slidesNodeModules, "react"),
      "react/jsx-runtime": path.join(
        slidesNodeModules,
        "react",
        "jsx-runtime.js",
      ),
      "react/jsx-dev-runtime": path.join(
        slidesNodeModules,
        "react",
        "jsx-dev-runtime.js",
      ),
      "react-dom": path.join(slidesNodeModules, "react-dom"),
      "react-dom/client": path.join(
        slidesNodeModules,
        "react-dom",
        "client.js",
      ),
      "realtime-bpm-analyzer": path.resolve(
        __dirname,
        "./node_modules/realtime-bpm-analyzer/dist/index.esm.js",
      ),
    },
  },
  server: {
    fs: {
      allow: [path.resolve(__dirname, "..")],
    },
  },
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      mode === "test" ? "test" : "production",
    ),
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    exclude: [...configDefaults.exclude, "vendor/**"],
  },
}));
