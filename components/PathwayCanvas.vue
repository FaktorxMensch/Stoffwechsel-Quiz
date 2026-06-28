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

// Geometrie der letzten Zeichnung (für Hittests). In CSS-Pixeln.
type Geom = {
  toPx: (nx: number, ny: number) => { x: number; y: number }
  toNorm: (px: number, py: number) => { x: number; y: number }
  nodes: { id: string; x: number; y: number }[]
  reactions: { id: string; samples: { x: number; y: number }[] }[]
}
let geom: Geom | null = null

function center() {
  const ns = props.pathway.nodes
  const cx = ns.reduce((a, n) => a + n.x, 0) / ns.length
  const cy = ns.reduce((a, n) => a + n.y, 0) / ns.length
  return { cx, cy }
}

function draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = C.panel
  ctx.fillRect(0, 0, w, h)

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

  // Titel in der Mitte (Orientierung)
  ctx.save()
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = 'rgba(255,255,255,0.05)'
  ctx.font = `700 ${Math.round(side * 0.06)}px ui-sans-serif, system-ui, sans-serif`
  ctx.fillText(p.name, cpx.x, cpx.y)
  ctx.restore()

  const nodePx = new Map(p.nodes.map((n) => [n.id, toPx(n.x, n.y)]))
  const reactionGeom: Geom['reactions'] = []

  // Reaktionen (Kanten) zeichnen
  for (const r of p.reactions) {
    const a = nodePx.get(r.from)
    const b = nodePx.get(r.to)
    if (!a || !b) continue
    // Kontrollpunkt: Mitte nach außen vom Zentrum gewölbt -> sauberer Ring
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    let nxv = mx - cpx.x
    let nyv = my - cpx.y
    const nl = Math.hypot(nxv, nyv) || 1
    nxv /= nl
    nyv /= nl
    const bow = side * 0.05
    const ctrl: [number, number] = [mx + nxv * bow, my + nyv * bow]

    const isRevealed = props.revealReactionId === r.id
    ctx.strokeStyle = isRevealed ? C.accent : C.edge
    ctx.lineWidth = isRevealed ? 4 : 2.2
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.quadraticCurveTo(ctrl[0], ctrl[1], b.x, b.y)
    ctx.stroke()

    // Pfeilspitzen (Richtung). Reversibel -> beidseitig.
    const headColor = isRevealed ? C.accent : C.edgeStrong
    const end = quadPoint([a.x, a.y], ctrl, [b.x, b.y], 0.9)
    arrowHead(ctx, end.x, end.y, end.angle, 9, headColor)
    if (r.reversible) {
      const start = quadPoint([a.x, a.y], ctrl, [b.x, b.y], 0.1)
      arrowHead(ctx, start.x, start.y, start.angle + Math.PI, 9, headColor)
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
    if (!r.labelPos) {
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
      ctx.font = `500 11px ui-sans-serif, system-ui, sans-serif`
      ctx.textAlign = 'center'
      const ins = r.cofactors.filter((c) => c.dir === 'in').map((c) => `+ ${c.name}`)
      const outs = r.cofactors.filter((c) => c.dir === 'out').map((c) => `→ ${c.name}`)
      const baseY = lp.y + (hasDeltaG ? 30 : 16)
      ctx.fillStyle = C.cofIn
      ctx.fillText(ins.join('  '), lp.x, baseY)
      ctx.fillStyle = C.cofOut
      ctx.fillText(outs.join('  '), lp.x, baseY + 14)
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
      let dx = px.x - cpx.x
      let dy = px.y - cpx.y
      const dl = Math.hypot(dx, dy) || 1
      dx /= dl
      dy /= dl
      const baseAng = Math.atan2(dy, dx)
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

function onClick(ev: MouseEvent) {
  if (!props.interactive || !geom || !canvasRef.value) return
  const rect = canvasRef.value.getBoundingClientRect()
  const px = ev.clientX - rect.left
  const py = ev.clientY - rect.top

  let nearestNodeId = geom.nodes[0]?.id ?? ''
  let nodeDist = Infinity
  for (const n of geom.nodes) {
    const d = dist(px, py, n.x, n.y)
    if (d < nodeDist) {
      nodeDist = d
      nearestNodeId = n.id
    }
  }

  let nearestReactionId = geom.reactions[0]?.id ?? ''
  let reactionDist = Infinity
  for (const r of geom.reactions) {
    for (const s of r.samples) {
      const d = dist(px, py, s.x, s.y)
      if (d < reactionDist) {
        reactionDist = d
        nearestReactionId = r.id
      }
    }
  }

  const norm = geom.toNorm(px, py)
  emit('pick', { nx: norm.x, ny: norm.y, nearestNodeId, nodeDist, nearestReactionId, reactionDist })
}
</script>

<template>
  <div class="canvas-wrap">
    <canvas
      ref="canvasRef"
      :class="{ interactive }"
      @click="onClick"
    />
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
}
canvas.interactive {
  cursor: crosshair;
}
</style>
