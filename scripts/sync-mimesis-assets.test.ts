// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, expect, it } from "vitest";

import { syncAssetPair } from "./sync-mimesis-assets-lib.mjs";

const tempDirs: string[] = [];

afterEach(async () => {
  await Promise.all(tempDirs.map((dir) => rm(dir, { recursive: true, force: true })));
  tempDirs.length = 0;
});

it("keeps committed assets when the sibling mimesis checkout is unavailable", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "slides-sync-assets-"));
  tempDirs.push(tempDir);

  const sourcePath = path.join(tempDir, "missing-source.jpg");
  const destinationPath = path.join(tempDir, "public", "images", "cover.jpg");

  await mkdir(path.dirname(destinationPath), { recursive: true });
  await writeFile(destinationPath, "existing-asset", "utf8");

  await expect(syncAssetPair(sourcePath, destinationPath)).resolves.toBe(false);
  await expect(readFile(destinationPath, "utf8")).resolves.toBe("existing-asset");
});
