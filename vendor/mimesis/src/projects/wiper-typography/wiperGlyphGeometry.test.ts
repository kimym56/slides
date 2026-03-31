import { Box3, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import {
  getWiperGlyphGeometry,
  getWiperSupportedGlyphs,
} from "./wiperGlyphGeometry";
import { WIPER_GLYPHS } from "./wiperConfig";

describe("wiperGlyphGeometry", () => {
  it("returns the same cached geometry instance for repeated glyph requests", () => {
    const first = getWiperGlyphGeometry("T");
    const second = getWiperGlyphGeometry("T");

    expect(second).toBe(first);
  });

  it("builds one geometry for every supported wiper glyph", () => {
    expect(getWiperSupportedGlyphs()).toEqual(WIPER_GLYPHS);
    expect(() => getWiperGlyphGeometry("X")).toThrow(/Unsupported wiper glyph/);
  });

  it("centers the extruded geometry around the local origin", () => {
    const bounds = new Box3().setFromBufferAttribute(
      getWiperGlyphGeometry("O").attributes.position
    );
    const center = new Vector3();

    bounds.getCenter(center);

    expect(Math.abs(center.x)).toBeLessThan(0.001);
    expect(Math.abs(center.y)).toBeLessThan(0.001);
  });

  it("extrudes glyphs with the thicker cockpit-stage depth", () => {
    const bounds = new Box3().setFromBufferAttribute(
      getWiperGlyphGeometry("T").attributes.position
    );

    expect(bounds.max.z - bounds.min.z).toBeCloseTo(16, 1);
  });
});
