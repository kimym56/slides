import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const slidesNodeModules = path.resolve(__dirname, "./node_modules");

export default defineConfig(({ mode }) => ({
  plugins: [react()],
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
      "@mimesis": path.resolve(__dirname, "../mimesis/src"),
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
  },
}));
