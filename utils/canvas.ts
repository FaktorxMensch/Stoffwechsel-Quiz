// Canvas-Zeichenhelfer.

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
): void {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

export function arrowHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  angle: number,
  size: number,
  color: string,
): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(angle)
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(-size, -size * 0.5)
  ctx.lineTo(-size, size * 0.5)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()
}

/** Punkt + Tangentenwinkel auf einer quadratischen Bézierkurve bei t. */
export function quadPoint(
  p0: [number, number],
  pc: [number, number],
  p1: [number, number],
  t: number,
): { x: number; y: number; angle: number } {
  const mt = 1 - t
  const x = mt * mt * p0[0] + 2 * mt * t * pc[0] + t * t * p1[0]
  const y = mt * mt * p0[1] + 2 * mt * t * pc[1] + t * t * p1[1]
  const dx = 2 * mt * (pc[0] - p0[0]) + 2 * t * (p1[0] - pc[0])
  const dy = 2 * mt * (pc[1] - p0[1]) + 2 * t * (p1[1] - pc[1])
  return { x, y, angle: Math.atan2(dy, dx) }
}

export function dist(ax: number, ay: number, bx: number, by: number): number {
  return Math.hypot(ax - bx, ay - by)
}
