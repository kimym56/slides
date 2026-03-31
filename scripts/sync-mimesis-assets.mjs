import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");

const assetMap = [
  [
    path.resolve(projectRoot, "../mimesis/public/images/love-jones-cover.jpg"),
    path.resolve(projectRoot, "public/images/love-jones-cover.jpg"),
  ],
  [
    path.resolve(projectRoot, "../mimesis/public/models/tesla_2018_model_3.glb"),
    path.resolve(projectRoot, "public/models/tesla_2018_model_3.glb"),
  ],
];

for (const [sourcePath, destinationPath] of assetMap) {
  await mkdir(path.dirname(destinationPath), { recursive: true });
  await copyFile(sourcePath, destinationPath);
}
