import { ExtrudeGeometry, Vector3 } from "three";
import helvetikerRegular from "three/examples/fonts/helvetiker_regular.typeface.json";
import {
  FontLoader,
  type FontData,
} from "three/examples/jsm/loaders/FontLoader.js";
import {
  WIPER_3D_GLYPH_EXTRUSION_DEPTH,
  WIPER_GLYPHS,
  WIPER_GLYPH_FONT_SIZE,
} from "./wiperConfig";

const font = new FontLoader().parse(helvetikerRegular as FontData);
const glyphGeometryCache = new Map<string, ExtrudeGeometry>();

export function getWiperSupportedGlyphs() {
  return WIPER_GLYPHS;
}

export function getWiperGlyphGeometry(glyph: string) {
  const cached = glyphGeometryCache.get(glyph);

  if (cached) {
    return cached;
  }

  if (!WIPER_GLYPHS.includes(glyph)) {
    throw new Error(`Unsupported wiper glyph: ${glyph}`);
  }

  const geometry = new ExtrudeGeometry(font.generateShapes(glyph, WIPER_GLYPH_FONT_SIZE), {
    bevelEnabled: false,
    curveSegments: 6,
    depth: WIPER_3D_GLYPH_EXTRUSION_DEPTH,
  });

  geometry.computeBoundingBox();

  const center = geometry.boundingBox?.getCenter(new Vector3()) ?? new Vector3();

  geometry.translate(-center.x, -center.y, -center.z);
  geometry.computeBoundingBox();

  glyphGeometryCache.set(glyph, geometry);

  return geometry;
}
