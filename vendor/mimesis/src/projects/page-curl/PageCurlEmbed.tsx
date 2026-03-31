'use client'

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from "./PageCurlProject.module.css";

interface Pt { x: number; y: number }

const PAD_RATIO = 0.08 // 8% of smaller dimension as padding on each side

// Returns the edge origin point and inward unit direction for a given angle.
// Angle is in degrees; 0 = right edge, 90 = bottom, 180 = left, 270 = top.
// Works in pixel space so the direction is visually correct for the canvas size.
function getOrigin(angleDeg: number, W: number, H: number): { origin: Pt; inward: Pt; maxDist: number } {
  const rad = (angleDeg * Math.PI) / 180
  const dx = Math.cos(rad)  // outward x (pixels)
  const dy = Math.sin(rad)  // outward y (pixels)

  // Ray from center (W/2, H/2) outward — find t where it hits the edge
  const tx = dx !== 0 ? (dx > 0 ? (W - W / 2) / dx : (0 - W / 2) / dx) : Infinity
  const ty = dy !== 0 ? (dy > 0 ? (H - H / 2) / dy : (0 - H / 2) / dy) : Infinity
  const t = Math.min(tx, ty)

  const origin: Pt = {
    x: Math.max(0, Math.min(W, W / 2 + dx * t)),
    y: Math.max(0, Math.min(H, H / 2 + dy * t)),
  }
  const len = Math.sqrt(dx * dx + dy * dy)
  const inward: Pt = { x: -dx / len, y: -dy / len }
  // max distance: fold must sweep past the farthest corner for a full flip
  const corners: Pt[] = [{ x: 0, y: 0 }, { x: W, y: 0 }, { x: W, y: H }, { x: 0, y: H }]
  const maxProj = Math.max(...corners.map(c =>
    (c.x - origin.x) * inward.x + (c.y - origin.y) * inward.y
  ))
  const maxDist = 2 * maxProj  // fold is at midpoint, so dist = 2× to reach farthest corner
  return { origin, inward, maxDist }
}

function clipPoly(poly: Pt[], ox: number, oy: number, nx: number, ny: number): Pt[] {
  const out: Pt[] = []
  const n = poly.length
  for (let i = 0; i < n; i++) {
    const a = poly[i], b = poly[(i + 1) % n]
    const da = (a.x - ox) * nx + (a.y - oy) * ny
    const db = (b.x - ox) * nx + (b.y - oy) * ny
    if (da >= 0) out.push(a)
    if ((da >= 0) !== (db >= 0)) {
      const t = da / (da - db)
      out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) })
    }
  }
  return out
}

function reflectPt(p: Pt, lx: number, ly: number, ldx: number, ldy: number): Pt {
  const nx = -ldy, ny = ldx
  const d = (p.x - lx) * nx + (p.y - ly) * ny
  return { x: p.x - 2 * d * nx, y: p.y - 2 * d * ny }
}

function tracePoly(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  if (pts.length < 2) return
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
  ctx.closePath()
}

// dist: peel distance in pixels from the edge origin toward center
function draw(
  canvas: HTMLCanvasElement,
  angleDeg: number,
  dist: number,           // 0 = flat, >0 = peeled
  backOpacity: number,    // 0–1: opacity of the back face image
  front: OffscreenCanvas | null,
  dpr: number,
  padding: number         // space around the page for curl overflow
) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const canvasW = canvas.width / dpr
  const canvasH = canvas.height / dpr
  const W = canvasW - 2 * padding
  const H = canvasH - 2 * padding
  if (W <= 0 || H <= 0) return

  ctx.save()
  ctx.scale(dpr, dpr)
  ctx.clearRect(0, 0, canvasW, canvasH)
  ctx.translate(padding, padding)

  const rPage = Math.min(12, W / 2, H / 2)
  const page: Pt[] = []
  const steps = 8
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2) - Math.PI / 2
    page.push({ x: W - rPage + rPage * Math.cos(a), y: rPage + rPage * Math.sin(a) })
  }
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2)
    page.push({ x: W - rPage + rPage * Math.cos(a), y: H - rPage + rPage * Math.sin(a) })
  }
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2) + Math.PI / 2
    page.push({ x: rPage + rPage * Math.cos(a), y: H - rPage + rPage * Math.sin(a) })
  }
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * (Math.PI / 2) + Math.PI
    page.push({ x: rPage + rPage * Math.cos(a), y: rPage + rPage * Math.sin(a) })
  }

  if (dist <= 0) {
    ctx.save()
    ctx.beginPath()
    tracePoly(ctx, page)
    ctx.clip()
    if (front) ctx.drawImage(front, 0, 0, W, H)
    else { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H) }
    ctx.restore()
    ctx.restore()
    return
  }

  const { origin, inward } = getOrigin(angleDeg, W, H)

  // Tip in pixel space
  const tip: Pt = {
    x: origin.x + inward.x * dist,
    y: origin.y + inward.y * dist,
  }

  // Fold midpoint between origin and tip
  const mx = (origin.x + tip.x) / 2
  const my = (origin.y + tip.y) / 2

  // Fold line direction: perpendicular to origin→tip
  const fdx = -inward.y, fdy = inward.x

  // Away normal: from origin toward tip (same as inward direction)
  const awnx = inward.x, awny = inward.y

  const flatPoly = clipPoly(page, mx, my, awnx, awny)
  const flapPoly = clipPoly(page, mx, my, -awnx, -awny)

  // Normalised curl progress (0 = flat, 1 = fully peeled)
  const curlP = Math.min(dist / Math.sqrt(W * W + H * H), 1)

  // 1. Flat front face
  ctx.save()
  ctx.beginPath()
  tracePoly(ctx, flatPoly)
  ctx.clip()
  if (front) ctx.drawImage(front, 0, 0, W, H)
  else { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H) }

  ctx.restore()

  if (flapPoly.length < 3) { ctx.restore(); return }

  // 2. Reflected flap (computed early so we can use its shape for the shadow)
  const reflectedFlap = flapPoly.map(p => reflectPt(p, mx, my, fdx, fdy))

  // 3. Shadow cast by the curled flap onto the front face
  // We use a combination of a true outer drop-shadow and an ambient occlusion gradient near the crease.
  if (flatPoly.length >= 3 && reflectedFlap.length >= 3) {
    ctx.save()
    ctx.beginPath()
    tracePoly(ctx, flatPoly)
    ctx.clip()

    // 3a. Cast a blurred drop shadow so it bleeds smoothly outside the flap
    ctx.save()
    ctx.shadowColor = `rgba(0,0,0,${0.35 * curlP})`
    ctx.shadowBlur = 10 + dist * 0.15
    ctx.shadowOffsetX = awnx * (dist * 0.05)
    ctx.shadowOffsetY = awny * (dist * 0.05)

    ctx.beginPath()
    tracePoly(ctx, reflectedFlap)
    ctx.fillStyle = '#000'
    ctx.fill()
    ctx.restore()

    // 3b. Add a linear gradient acting as ambient occlusion right at the crease line
    // This creates depth by grounding the base of the curl to the page
    const aoS = Math.min(W, H) * 0.5
    const gx0 = mx, gy0 = my
    const gx1 = mx + awnx * aoS, gy1 = my + awny * aoS
    const aoGrad = ctx.createLinearGradient(gx0, gy0, gx1, gy1)
    aoGrad.addColorStop(0, `rgba(0,0,0,${0.5 * curlP})`)
    aoGrad.addColorStop(0.1, `rgba(0,0,0,${0.15 * curlP})`)
    aoGrad.addColorStop(1, 'rgba(0,0,0,0)')

    ctx.fillStyle = aoGrad
    // Fill the whole canvas area; the flatPoly clip ensures it only draws on the flat page
    ctx.fillRect(-W, -H, W * 3, H * 3)

    ctx.restore()
  }

  // 4. Reflected flap image (extends into padding for curl overflow)
  ctx.save()
  ctx.beginPath()
  tracePoly(ctx, reflectedFlap)
  ctx.clip()

  // Fill the background of the flap with white so it's not black or transparent when opacity is low
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(-W, -H, W * 3, H * 3)

  if (front) {
    const nx = -fdy, ny = fdx   // fold normal (unit, since fdx²+fdy²=1)
    ctx.transform(
      1 - 2 * nx * nx, -2 * nx * ny,
      -2 * nx * ny, 1 - 2 * ny * ny,
      2 * (mx * nx * nx + my * nx * ny),
      2 * (mx * nx * ny + my * ny * ny)
    )
    ctx.globalAlpha = backOpacity
    ctx.drawImage(front, 0, 0, W, H)
    ctx.globalAlpha = 1
  } else {
    ctx.fillStyle = '#f5f3f0'
    ctx.fillRect(-W, -H, W * 3, H * 3)
  }
  ctx.restore()

  // 5. Cylindrical shading on back face — follows the reflected flap everywhere
  ctx.save()
  ctx.beginPath()
  tracePoly(ctx, reflectedFlap)
  ctx.clip()
  {
    const flapDists = reflectedFlap.map(p =>
      (p.x - mx) * awnx + (p.y - my) * awny
    )
    const maxFlapDist = Math.max(...flapDists, 1)

    const gx0 = mx, gy0 = my
    const gx1 = mx + awnx * maxFlapDist, gy1 = my + awny * maxFlapDist

    const core = ctx.createLinearGradient(gx0, gy0, gx1, gy1)
    core.addColorStop(0, `rgba(0,0,0,${0.12 * curlP})`)
    core.addColorStop(0.15, `rgba(0,0,0,${0.28 * curlP})`)
    core.addColorStop(0.35, `rgba(0,0,0,${0.18 * curlP})`)
    core.addColorStop(0.6, `rgba(0,0,0,${0.08 * curlP})`)
    core.addColorStop(0.85, `rgba(0,0,0,${0.15 * curlP})`)
    core.addColorStop(1, `rgba(0,0,0,${0.25 * curlP})`)
    ctx.fillStyle = core
    ctx.fillRect(-W, -H, W * 3, H * 3)

    const spec = ctx.createLinearGradient(gx0, gy0, gx1, gy1)
    spec.addColorStop(0, `rgba(255,255,255,${0.35 * curlP * backOpacity})`)
    spec.addColorStop(0.08, `rgba(255,255,255,${0.18 * curlP * backOpacity})`)
    spec.addColorStop(0.2, 'rgba(255,255,255,0)')
    spec.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = spec
    ctx.fillRect(-W, -H, W * 3, H * 3)
  }
  ctx.restore()

  // 6. Curved band at the fold — clipped to reflected flap surface
  {
    // The bend radius narrows as the curl progresses (cone effect)
    // At dist=0, band is small. As we pull further, the band near the center gets wider, but near the tip it stays tight.
    // We achieve a faux-cone effect by adjusting the width of the specular highlight band based on dist and perspective.
    const bandBack = Math.max(6, Math.min(40, dist * 0.18))
    const x0 = mx, y0 = my
    // To simulate a cone, we shift the gradient endpoints a bit to widen it as it travels inward
    const x1 = mx - awnx * bandBack, y1 = my - awny * bandBack

    ctx.save()
    ctx.beginPath()
    tracePoly(ctx, reflectedFlap)
    ctx.clip()

    const bFar = Math.max(W, H) * 2
    const bx = fdx * bFar, by = fdy * bFar

    // We use a slight radial or skew expansion if we wanted true cones, 
    // but a scaled linear gradient spanning further back creates a very convincing 2.5D softer bend.
    ctx.beginPath()
    ctx.moveTo(x0 + bx, y0 + by)
    ctx.lineTo(x0 - bx, y0 - by)
    ctx.lineTo(x1 - bx, y1 - by)
    ctx.lineTo(x1 + bx, y1 + by)
    ctx.closePath()
    ctx.clip()

    // Base dark crease
    const cg = ctx.createLinearGradient(x0, y0, x1, y1)
    cg.addColorStop(0, `rgba(0,0,0,${0.45 * curlP})`)
    cg.addColorStop(0.3, `rgba(0,0,0,${0.25 * curlP})`)
    cg.addColorStop(0.7, `rgba(0,0,0,${0.10 * curlP})`)
    cg.addColorStop(1, `rgba(0,0,0,${0.02 * curlP})`)
    ctx.fillStyle = cg
    ctx.fillRect(-W, -H, W * 3, H * 3)

    // Specular highlight pushes slightly further away from the crease as we pull the page more
    const specOffset = x0 - awnx * (bandBack * 0.15)
    const specOffsetY = y0 - awny * (bandBack * 0.15)

    const sg = ctx.createLinearGradient(specOffset, specOffsetY, x1, y1)
    sg.addColorStop(0, `rgba(255,255,255,0)`)
    sg.addColorStop(0.1, `rgba(255,255,255,${0.40 * curlP * backOpacity})`)
    sg.addColorStop(0.3, `rgba(255,255,255,${0.15 * curlP * backOpacity})`)
    sg.addColorStop(0.6, 'rgba(255,255,255,0)')
    sg.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = sg
    ctx.fillRect(-W, -H, W * 3, H * 3)

    ctx.restore()
  }

  ctx.restore()
}

function makeFrontFromImage(img: ImageBitmap, W: number, H: number, dpr: number): OffscreenCanvas {
  const oc = new OffscreenCanvas(Math.round(W * dpr), Math.round(H * dpr))
  const c = oc.getContext('2d')!
  c.scale(dpr, dpr)

  // Clip to rounded rect
  c.beginPath()
  c.roundRect(0, 0, W, H, 12)
  c.clip()

  // Draw image with cover-fit (fill canvas, center-crop)
  const iw = img.width, ih = img.height
  const scale = Math.max(W / iw, H / ih)
  const sw = iw * scale, sh = ih * scale
  c.drawImage(img, (W - sw) / 2, (H - sh) / 2, sw, sh)

  return oc
}

export default function PageCurlEmbed({ demo = false }: { demo?: boolean }) {
  const initialOpacity = demo ? 0.5 : 1
  const initialAngle = demo ? 45 : 225

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frontRef = useRef<OffscreenCanvas | null>(null)
  const coverRef = useRef<ImageBitmap | null>(null)
  const pageSizeRef = useRef<{ w: number; h: number; pad: number }>({ w: 0, h: 0, pad: 0 })

  // Single source of truth: peel distance in pixels
  const distRef = useRef(demo ? 80 : 0)
  const angleRef = useRef(initialAngle)
  const targetAngleRef = useRef(initialAngle)
  const opacityRef = useRef(initialOpacity)
  const dragging = useRef(false)
  const downClientRef = useRef<Pt>({ x: 0, y: 0 })
  const distAtDownRef = useRef(0)
  const rafRef = useRef(0)
  const angleRafRef = useRef(0)

  const [opacity, setOpacity] = useState(initialOpacity)
  const [angle, setAngle] = useState(initialAngle)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    draw(canvas, angleRef.current, distRef.current, opacityRef.current, frontRef.current, dpr, pageSizeRef.current.pad)
  }, [])

  const buildSurfaces = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const W = canvas.offsetWidth
    const H = canvas.offsetHeight
    if (!W || !H) return
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const pad = Math.min(W, H) * PAD_RATIO
    const pageW = W - 2 * pad
    const pageH = H - 2 * pad
    pageSizeRef.current = { w: pageW, h: pageH, pad }
    if (coverRef.current) {
      frontRef.current = makeFrontFromImage(coverRef.current, pageW, pageH, dpr)
    }
    render()
  }, [render])

  useEffect(() => {
    let cancelled = false
    fetch('/images/love-jones-cover.jpg')
      .then(r => r.blob())
      .then(b => createImageBitmap(b))
      .then(bmp => {
        if (cancelled) return
        coverRef.current = bmp
        buildSurfaces()
      })
    const ro = new ResizeObserver(buildSurfaces)
    if (canvasRef.current) ro.observe(canvasRef.current)
    return () => { cancelled = true; ro.disconnect() }
  }, [buildSurfaces])

  // Angle change: animate angleRef toward the target over multiple frames
  useEffect(() => {
    targetAngleRef.current = angle % 360
    cancelAnimationFrame(angleRafRef.current)

    function animateAngle() {
      const current = angleRef.current
      const target = targetAngleRef.current

      // Shortest-path delta on the circle
      const delta = ((target - current + 540) % 360) - 180
      if (Math.abs(delta) < 0.3) {
        angleRef.current = target
        render()
        return
      }

      angleRef.current = (current + delta * 0.18 + 360) % 360
      render()
      angleRafRef.current = requestAnimationFrame(animateAngle)
    }

    angleRafRef.current = requestAnimationFrame(animateAngle)
  }, [angle, render])

  useEffect(() => {
    opacityRef.current = opacity
    render()
  }, [opacity, render])

  const onDown = useCallback((clientX: number, clientY: number) => {
    dragging.current = true
    downClientRef.current = { x: clientX, y: clientY }
    distAtDownRef.current = distRef.current
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(render)
  }, [render])

  const onMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging.current) return
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const canvasW = canvas.width / dpr
    const canvasH = canvas.height / dpr
    const r = canvas.getBoundingClientRect()

    const { w: pageW, h: pageH } = pageSizeRef.current
    const { inward, maxDist } = getOrigin(angleRef.current, pageW, pageH)

    // Project pointer delta onto inward direction (in canvas pixel space)
    const scaleX = canvasW / r.width
    const scaleY = canvasH / r.height
    const dragDx = (clientX - downClientRef.current.x) * scaleX
    const dragDy = (clientY - downClientRef.current.y) * scaleY
    const proj = dragDx * inward.x + dragDy * inward.y

    distRef.current = Math.max(0, Math.min(maxDist, distAtDownRef.current + proj))
    cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(render)
  }, [render])

  const onUp = useCallback(() => {
    dragging.current = false
  }, [])

  useEffect(() => {
    if (demo) return
    const mm = (e: MouseEvent) => {
      // If mouse button was released outside the window, stop dragging
      if (dragging.current && e.buttons === 0) {
        onUp()
        return
      }
      onMove(e.clientX, e.clientY)
    }
    const mu = () => onUp()
    const tm = (e: TouchEvent) => onMove(e.touches[0].clientX, e.touches[0].clientY)
    const te = () => onUp()
    window.addEventListener('mousemove', mm)
    window.addEventListener('mouseup', mu)
    window.addEventListener('touchmove', tm, { passive: true })
    window.addEventListener('touchend', te)
    return () => {
      window.removeEventListener('mousemove', mm)
      window.removeEventListener('mouseup', mu)
      window.removeEventListener('touchmove', tm)
      window.removeEventListener('touchend', te)
    }
  }, [demo, onMove, onUp])

  return (
    <div className={styles.embedWrapper}>
      <canvas
        ref={canvasRef}
        className={styles.curlCanvas}
        onMouseDown={demo ? undefined : (e) => onDown(e.clientX, e.clientY)}
        onTouchStart={demo ? undefined : (e) => onDown(e.touches[0].clientX, e.touches[0].clientY)}
        style={demo ? { cursor: 'default' } : undefined}
        aria-label={demo ? 'iOS page curl reference' : 'Page curl — drag to peel'}
      />
      {!demo && (
        <div className={styles.embedControls}>
          <div className={styles.controlItem}>
            <span className={styles.controlLabel}>Opacity</span>
            <input
              type="range"
              min="0" max="1" step="0.01"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className={styles.slider}
              aria-label="Shadow opacity"
            />
          </div>
          <div className={styles.controlItem}>
            <span className={styles.controlLabel}>Angle</span>
            <input
              type="range"
              min="0" max="315" step="1"
              value={angle}
              onChange={(e) => setAngle(parseInt(e.target.value))}
              className={styles.slider}
              aria-label="Curl angle"
            />
          </div>
        </div>
      )}
    </div>
  )
}
