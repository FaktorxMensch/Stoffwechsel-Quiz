<script setup lang="ts">
import type { Pathway } from '~/types/metabolism'
import { C } from '~/utils/theme'
import { arrowHead, dist, quadPoint, roundRect } from '~/utils/canvas'

const props = withDefaults(
  defineProps<{
    pathway: Pathway
    highlightIds?: string[]
    revealNodeIds?: string[]
    revealReactionId?: string | null
    hideNodeNames?: boolean
    hideEnzymes?: boolean
    hideCofactors?: boolean
    hideDeltaG?: boolean
    hideBranches?: boolean
    markers?: { x: number; y: number; color: string }[]
    interactive?: boolean
  }>(),
  {
    highlightIds: () => [],
    revealNodeIds: () => [],
    revealReactionId: null,
    hideDeltaG: false,
    hideBranches: false,
    markers: () => [],
    interactive: false,
  },
)

const emit = defineEmits<{
  pick: [
    {
      nx: number
      ny: number
      nearestNodeId: string
      nodeDist: number
      nearestReactionId: string
      reactionDist: number
    },
  ]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)

// Ansicht: Zoom (Mausrad) + Pan (Ziehen). tx/ty in Bildschirm-Pixeln, scale dimensionslos.
const view = reactive({ scale: 1, tx: 0, ty: 0 })
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))

// Geometrie der letzten Zeichnung (für Hittests). In CSS-Pixeln.
type Geom = {
  toPx: (nx: number, ny: number) => { x: number; y: number }
  toNorm: (px: number, py: number) => { x: number; y: number }
  nodes: { id: string; x: number; y: number }[]
  reactions: { id: string; samples: { x: number; y: number }[] }[]
}
let geom: Geom | null = null

type Pt = { x: number; y: number }

function center() {
  const ns = props.pathway.nodes
  const cx = ns.reduce((a, n) => a + n.x, 0) / ns.length
  const cy = ns.reduce((a, n) => a + n.y, 0) / ns.length
  return { cx, cy }
}

function strongFlux(r: Pathway['reactions'][number]) {
  return !r.reversible || Math.abs(r.deltaG ?? 0) >= 5
}

function strokeReactionPath(
  ctx: CanvasRenderingContext2D,
  a: Pt,
  ctrl: [number, number],
  b: Pt,
  style: { color: string; width: number; alpha?: number },
) {
  ctx.save()
  ctx.globalAlpha = style.alpha ?? 1
  ctx.strokeStyle = style.color
  ctx.lineWidth = style.width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.quadraticCurveTo(ctrl[0], ctrl[1], b.x, b.y)
  ctx.stroke()
  ctx.restore()
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = C.panel
  ctx.fillRect(0, 0, w, h)

  // Zoom/Pan-Transform (Hintergrund bleibt im Bildschirmraum)
  ctx.save()
  ctx.translate(view.tx, view.ty)
  ctx.scale(view.scale, view.scale)

  const side = Math.min(w, h)
  const ox = (w - side) / 2
  const oy = (h - side) / 2
  const inset = side * 0.1
  const span = side - 2 * inset
  const toPx = (nx: number, ny: number) => ({ x: ox + inset + nx * span, y: oy + inset + ny * span })
  const toNorm = (px: number, py: number) => ({ x: (px - ox - inset) / span, y: (py - oy - inset) / span })

  const p = props.pathway
  const { cx, cy } = center()
  const cpx = toPx(cx, cy)

  const isLinear = p.layout === 'linear'

  // Titel in der Mitte (Orientierung) – nur bei Kreis-Layout
  if (!isLinear) {
    ctx.save()
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = 'rgba(255,255,255,0.05)'
    ctx.font = `700 ${Math.round(side * 0.06)}px ui-sans-serif, system-ui, sans-serif`
    ctx.fillText(p.name, cpx.x, cpx.y)
    ctx.restore()
  }

  const nodePx = new Map(p.nodes.map((n) => [n.id, toPx(n.x, n.y)]))
  const reactionGeom: Geom['reactions'] = []

  // Reaktionen (Kanten) zeichnen
  for (const r of p.reactions) {
    const a = nodePx.get(r.from)
    const b = nodePx.get(r.to)
    if (!a || !b) continue
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    let nxv: number
    let nyv: number
    let ctrl: [number, number]
    if (isLinear) {
      // Linear: gerade Linie; Beschriftungsseite = Senkrechte (konsistent nach rechts)
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dl = Math.hypot(dx, dy) || 1
      nxv = dy / dl
      nyv = -dx / dl
      if (nxv < 0) {
        nxv = -nxv
        nyv = -nyv
      }
      ctrl = [mx, my]
    } else {
      // Kreis: Kontrollpunkt nach außen vom Zentrum gewölbt -> sauberer Ring
      let vx = mx - cpx.x
      let vy = my - cpx.y
      const nl = Math.hypot(vx, vy) || 1
      vx /= nl
      vy /= nl
      nxv = vx
      nyv = vy
      const bow = side * 0.05
      ctrl = [mx + nxv * bow, my + nyv * bow]
    }

    const isRevealed = props.revealReactionId === r.id
    const isStrong = strongFlux(r)
    const lineWidth = isRevealed ? 5.5 : isStrong ? 4.8 : 2
    const stroke = isRevealed ? C.accent : isStrong ? C.edgeStrong : C.edge

    if (isStrong || isRevealed) {
      strokeReactionPath(ctx, a, ctrl, b, {
        color: isRevealed ? C.accent : C.enzyme,
        width: lineWidth + 5,
        alpha: isRevealed ? 0.16 : 0.1,
      })
    }
    strokeReactionPath(ctx, a, ctrl, b, { color: stroke, width: lineWidth })

    // Pfeilspitzen (Richtung). Reversibel -> beidseitig.
    const headColor = isRevealed ? C.accent : isStrong ? C.edgeStrong : C.edge
    const headSize = isRevealed ? 13 : isStrong ? 12 : 8
    const end = quadPoint([a.x, a.y], ctrl, [b.x, b.y], 0.84)
    arrowHead(ctx, end.x, end.y, end.angle, headSize, headColor)
    if (r.reversible) {
      const start = quadPoint([a.x, a.y], ctrl, [b.x, b.y], 0.16)
      arrowHead(ctx, start.x, start.y, start.angle + Math.PI, headSize, headColor)
    }

    // Geometrie für Hittest
    reactionGeom.push({
      id: r.id,
      samples: [0.25, 0.5, 0.75].map((t) => {
        const q = quadPoint([a.x, a.y], ctrl, [b.x, b.y], t)
        return { x: q.x, y: q.y }
      }),
    })

    // Enzym-Label + Cofaktoren außerhalb des Rings
    const mid = quadPoint([a.x, a.y], ctrl, [b.x, b.y], 0.5)
    // Label weit nach außen schieben -> die Außen-Normalen divergieren und spreizen die Labels
    const labelOff = side * 0.085
    const lp = r.labelPos ? toPx(r.labelPos.x, r.labelPos.y) : { x: mid.x + nxv * labelOff, y: mid.y + nyv * labelOff }
    if (!r.labelPos && !isLinear) {
      // Pol-nahe Labels (oben/unten, Normale fast senkrecht) horizontal auseinanderziehen
      const vert = 1 - Math.abs(nxv)
      lp.x += Math.sign(mid.x - cpx.x || 1) * side * 0.07 * vert
    }

    if (!props.hideEnzymes) {
      ctx.font = `600 12px ui-sans-serif, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const tw = ctx.measureText(r.enzyme).width
      roundRect(ctx, lp.x - tw / 2 - 7, lp.y - 11, tw + 14, 22, 6)
      ctx.fillStyle = C.enzymeBg
      ctx.fill()
      ctx.strokeStyle = r.reversible ? 'rgba(127,209,185,0.4)' : 'rgba(240,144,122,0.4)'
      ctx.lineWidth = 1
      ctx.stroke()
      ctx.fillStyle = C.enzyme
      ctx.fillText(r.enzyme, lp.x, lp.y)
      if (r.uncertain) {
        ctx.fillStyle = C.wrong
        ctx.fillText('*', lp.x + tw / 2 + 10, lp.y - 4)
      }
    }

    // ΔG-Wert unter dem Enzym (grün = exergon, rot = endergon)
    const hasDeltaG = !props.hideEnzymes && !props.hideDeltaG && r.deltaG !== undefined
    if (hasDeltaG) {
      const g = r.deltaG as number
      ctx.font = `600 11px ui-sans-serif, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.fillStyle = g < 0 ? C.cofIn : g > 0 ? C.cofOut : C.muted
      ctx.fillText(`ΔG ${g > 0 ? '+' : ''}${g} kcal`, lp.x, lp.y + 15)
    }

    if (!props.hideCofactors && r.cofactors.length) {
      const ins = r.cofactors.filter((c) => c.dir === 'in').map((c) => c.name)
      const outs = r.cofactors.filter((c) => c.dir === 'out').map((c) => c.name)
      const reach = side * 0.085 // Länge des gebogenen Cofaktor-Pfeils nach außen
      // Linear: Cofaktoren auf die Gegenseite des Enzyms (links), sonst nach außen
      const cofNx = isLinear ? -nxv : nxv
      const cofNy = isLinear ? -nyv : nyv

      // Gebogener Pfeil + Beschriftung; dir=-1 (Edukt rein), dir=+1 (Produkt raus)
      const drawCofactor = (t: number, dir: number, names: string[], color: string) => {
        if (!names.length) return
        const P = quadPoint([a.x, a.y], ctrl, [b.x, b.y], t) // Punkt auf der Reaktionskurve
        const tx = Math.cos(P.angle)
        const ty = Math.sin(P.angle)
        // Außen-Endpunkt: nach außen (Normale) + tangential in Flussrichtung versetzt
        const ex = P.x + cofNx * reach + tx * dir * side * 0.045
        const ey = P.y + cofNy * reach + ty * dir * side * 0.045
        // Kontrollpunkt gerade nach außen -> schöne runde Kurve
        const cxp = P.x + cofNx * reach * 0.5
        const cyp = P.y + cofNy * reach * 0.5
        ctx.strokeStyle = color
        ctx.lineWidth = 1.6
        ctx.beginPath()
        if (dir < 0) {
          // Edukt: vom Text außen in die Reaktionskurve hinein, Pfeilspitze auf der Kurve
          ctx.moveTo(ex, ey)
          ctx.quadraticCurveTo(cxp, cyp, P.x, P.y)
          ctx.stroke()
          arrowHead(ctx, P.x, P.y, Math.atan2(P.y - cyp, P.x - cxp), 6, color)
        } else {
          // Produkt: aus der Reaktionskurve nach außen, Pfeilspitze außen am Text
          ctx.moveTo(P.x, P.y)
          ctx.quadraticCurveTo(cxp, cyp, ex, ey)
          ctx.stroke()
          arrowHead(ctx, ex, ey, Math.atan2(ey - cyp, ex - cxp), 6, color)
        }
        // Beschriftung am Außen-Ende, mehrzeilig nach außen gestapelt
        ctx.font = `500 11px ui-sans-serif, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = color
        names.forEach((nm, i) => {
          ctx.fillText(nm, ex + cofNx * (9 + i * 13), ey + cofNy * (9 + i * 13))
        })
      }

      drawCofactor(0.4, -1, ins, C.cofIn)
      drawCofactor(0.6, 1, outs, C.cofOut)
    }
  }

  // Knoten zeichnen
  for (const n of p.nodes) {
    const px = nodePx.get(n.id)!
    const highlighted = props.highlightIds.includes(n.id)
    const named = !props.hideNodeNames || props.revealNodeIds.includes(n.id)

    if (highlighted) {
      ctx.beginPath()
      ctx.arc(px.x, px.y, 26, 0, Math.PI * 2)
      ctx.fillStyle = C.ring
      ctx.fill()
    }

    if (named) {
      ctx.font = `600 13px ui-sans-serif, system-ui, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      const tw = ctx.measureText(n.name).width
      roundRect(ctx, px.x - tw / 2 - 10, px.y - 13, tw + 20, 26, 8)
      ctx.fillStyle = C.node
      ctx.fill()
      ctx.strokeStyle = highlighted ? C.accent : C.nodeBorder
      ctx.lineWidth = highlighted ? 2 : 1.2
      ctx.stroke()
      ctx.fillStyle = C.nodeText
      ctx.fillText(n.name, px.x, px.y)
    } else {
      // Quiz: nur Position als Punkt sichtbar
      ctx.beginPath()
      ctx.arc(px.x, px.y, 7, 0, Math.PI * 2)
      ctx.fillStyle = C.node
      ctx.fill()
      ctx.strokeStyle = C.nodeBorder
      ctx.lineWidth = 1.4
      ctx.stroke()
    }
  }

  // Abzweige in andere Stoffwechselwege (gestrichelte Pfeile nach außen)
  if (!props.hideBranches) {
    for (const n of p.nodes) {
      if (!n.branches?.length) continue
      const px = nodePx.get(n.id)!
      let baseAng: number
      if (isLinear) {
        baseAng = Math.PI // Abzweige nach links (Enzyme stehen rechts)
      } else {
        const dx = px.x - cpx.x
        const dy = px.y - cpx.y
        baseAng = Math.atan2(dy, dx)
      }
      const len = side * 0.135
      n.branches.forEach((b, i) => {
        const ang = baseAng + (i - (n.branches!.length - 1) / 2) * 0.5
        const sx = px.x + Math.cos(ang) * 22
        const sy = px.y + Math.sin(ang) * 22
        const ex = px.x + Math.cos(ang) * len
        const ey = px.y + Math.sin(ang) * len
        ctx.strokeStyle = C.accent
        ctx.lineWidth = 1.6
        ctx.setLineDash([5, 4])
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(ex, ey)
        ctx.stroke()
        ctx.setLineDash([])
        arrowHead(ctx, ex, ey, ang, 7, C.accent)
        ctx.font = `600 11px ui-sans-serif, system-ui, sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        const tw = ctx.measureText(b.to).width
        const lx = ex + Math.cos(ang) * (tw / 2 + 6)
        const ly = ey + Math.sin(ang) * 10
        roundRect(ctx, lx - tw / 2 - 6, ly - 9, tw + 12, 18, 5)
        ctx.fillStyle = 'rgba(110,168,254,0.16)'
        ctx.fill()
        ctx.fillStyle = C.accent
        ctx.fillText(b.to, lx, ly)
      })
    }
  }

  // Klick-Marker
  for (const m of props.markers) {
    const px = toPx(m.x, m.y)
    ctx.beginPath()
    ctx.arc(px.x, px.y, 9, 0, Math.PI * 2)
    ctx.fillStyle = m.color
    ctx.globalAlpha = 0.85
    ctx.fill()
    ctx.globalAlpha = 1
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.stroke()
  }

  ctx.restore()

  geom = {
    toPx,
    toNorm,
    nodes: p.nodes.map((n) => ({ id: n.id, ...nodePx.get(n.id)! })),
    reactions: reactionGeom,
  }
}

const { render } = useDpiCanvas(canvasRef, draw)

// Neu zeichnen bei Prop-Änderungen
watch(
  () => [
    props.pathway,
    props.highlightIds,
    props.revealNodeIds,
    props.revealReactionId,
    props.hideNodeNames,
    props.hideEnzymes,
    props.hideCofactors,
    props.hideDeltaG,
    props.hideBranches,
    props.markers,
  ],
  () => render(),
  { deep: true },
)

// Beim Wechsel des Stoffwechselwegs Zoom/Pan zurücksetzen
watch(
  () => props.pathway.id,
  () => resetView(),
)

// Bildschirm- -> Welt-Koordinaten (Layout-Pixel vor der Zoom/Pan-Transform)
function toWorld(sx: number, sy: number) {
  return { x: (sx - view.tx) / view.scale, y: (sy - view.ty) / view.scale }
}

function zoomBy(factor: number, cx: number, cy: number) {
  const newScale = clamp(view.scale * factor, 0.4, 8)
  // Punkt unter dem Cursor festhalten
  view.tx = cx - ((cx - view.tx) * newScale) / view.scale
  view.ty = cy - ((cy - view.ty) * newScale) / view.scale
  view.scale = newScale
  render()
}

function resetView() {
  view.scale = 1
  view.tx = 0
  view.ty = 0
  render()
}
defineExpose({ resetView })

function onWheel(ev: WheelEvent) {
  ev.preventDefault()
  const rect = canvasRef.value?.getBoundingClientRect()
  if (!rect) return
  zoomBy(ev.deltaY < 0 ? 1.12 : 1 / 1.12, ev.clientX - rect.left, ev.clientY - rect.top)
}

// Pan vs. Klick unterscheiden: bewegt sich die Maus kaum, gilt es als Klick (Auswahl/Quiz).
let dragging = false
let moved = false
let startX = 0
let startY = 0
let startTx = 0
let startTy = 0

function onPointerDown(ev: PointerEvent) {
  dragging = true
  moved = false
  startX = ev.clientX
  startY = ev.clientY
  startTx = view.tx
  startTy = view.ty
  ;(ev.target as HTMLElement).setPointerCapture?.(ev.pointerId)
}

function onPointerMove(ev: PointerEvent) {
  if (!dragging) return
  const dx = ev.clientX - startX
  const dy = ev.clientY - startY
  if (Math.abs(dx) + Math.abs(dy) > 4) moved = true
  view.tx = startTx + dx
  view.ty = startTy + dy
  render()
}

function onPointerUp(ev: PointerEvent) {
  if (!dragging) return
  dragging = false
  if (moved) return // war ein Pan, kein Klick
  if (!props.interactive || !geom || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const wpt = toWorld(ev.clientX - rect.left, ev.clientY - rect.top)

  let nearestNodeId = geom.nodes[0]?.id ?? ''
  let nodeDist = Infinity
  for (const n of geom.nodes) {
    const d = dist(wpt.x, wpt.y, n.x, n.y)
    if (d < nodeDist) {
      nodeDist = d
      nearestNodeId = n.id
    }
  }

  let nearestReactionId = geom.reactions[0]?.id ?? ''
  let reactionDist = Infinity
  for (const r of geom.reactions) {
    for (const s of r.samples) {
      const d = dist(wpt.x, wpt.y, s.x, s.y)
      if (d < reactionDist) {
        reactionDist = d
        nearestReactionId = r.id
      }
    }
  }

  const norm = geom.toNorm(wpt.x, wpt.y)
  emit('pick', { nx: norm.x, ny: norm.y, nearestNodeId, nodeDist, nearestReactionId, reactionDist })
}
</script>

<template>
  <div class="canvas-wrap">
    <canvas
      ref="canvasRef"
      :class="{ interactive }"
      @wheel="onWheel"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointerleave="onPointerUp"
    />
    <div class="zoom-ctrl">
      <button title="Vergrößern" @click="zoomBy(1.25, (canvasRef?.clientWidth ?? 0) / 2, (canvasRef?.clientHeight ?? 0) / 2)">+</button>
      <button title="Verkleinern" @click="zoomBy(1 / 1.25, (canvasRef?.clientWidth ?? 0) / 2, (canvasRef?.clientHeight ?? 0) / 2)">−</button>
      <button title="Ansicht zurücksetzen" @click="resetView">⟲</button>
    </div>
    <div class="zoom-hint">Mausrad: Zoom · Ziehen: Verschieben</div>
  </div>
</template>

<style scoped>
.canvas-wrap {
  position: relative;
  width: 100%;
  height: 100%;
}
canvas {
  display: block;
  border-radius: 12px;
  cursor: grab;
  touch-action: none;
}
canvas:active {
  cursor: grabbing;
}
.zoom-ctrl {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.zoom-ctrl button {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--panel-2);
  color: var(--text);
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
.zoom-ctrl button:hover {
  border-color: var(--accent);
}
.zoom-hint {
  position: absolute;
  bottom: 8px;
  left: 12px;
  font-size: 11px;
  color: var(--muted);
  pointer-events: none;
}
</style>
