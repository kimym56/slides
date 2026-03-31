import {
  WIPER_BAR_COLOR,
  WIPER_GLYPH_COLOR,
  WIPER_GLYPH_FONT_SIZE,
  WIPER_GLYPH_TEXT_OFFSET_Y,
} from "./wiperConfig";
import type {
  WiperBarState,
  WiperGlyphState,
  WiperSimulationState,
} from "./wiperSimulation";

interface DrawWiperSceneOptions {
  backgroundColor?: string;
}

function drawGlyph(context: CanvasRenderingContext2D, glyph: WiperGlyphState) {
  context.save();
  context.translate(glyph.x, glyph.y);
  context.rotate(glyph.rotation * Math.PI);
  context.textAlign = "center";
  context.font = `bold ${WIPER_GLYPH_FONT_SIZE}px Helvetica`;
  context.fillStyle = WIPER_GLYPH_COLOR;
  context.fillText(glyph.text, 0, WIPER_GLYPH_TEXT_OFFSET_Y);
  context.restore();
}

function drawBar(context: CanvasRenderingContext2D, bar: WiperBarState) {
  context.save();
  context.fillStyle = WIPER_BAR_COLOR;
  context.translate(bar.x, bar.y);
  context.rotate(bar.rotation);
  context.fillRect(-bar.radius, -bar.height * 0.5, bar.width, bar.height);
  context.restore();
}

export function drawWiperScene(
  context: CanvasRenderingContext2D,
  scene: Pick<WiperSimulationState, "bars" | "glyphs" | "height" | "width">,
  { backgroundColor }: DrawWiperSceneOptions = {}
) {
  if (backgroundColor) {
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, scene.width, scene.height);
  } else {
    context.clearRect(0, 0, scene.width, scene.height);
  }

  for (const glyph of scene.glyphs) {
    drawGlyph(context, glyph);
  }

  for (const bar of scene.bars) {
    drawBar(context, bar);
  }
}
