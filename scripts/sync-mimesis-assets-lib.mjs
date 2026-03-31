import { access, copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { constants as fsConstants } from "node:fs";

export async function pathExists(targetPath) {
  try {
    await access(targetPath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function syncAssetPair(sourcePath, destinationPath) {
  const sourceExists = await pathExists(sourcePath);

  if (!sourceExists) {
    return false;
  }

  await mkdir(path.dirname(destinationPath), { recursive: true });
  await copyFile(sourcePath, destinationPath);
  return true;
}
