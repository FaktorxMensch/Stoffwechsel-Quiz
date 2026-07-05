<script setup lang="ts">
import { overviewEdges, overviewNodes, type OverviewNode } from '~/data/overview'
import { getPathway } from '~/data/pathways'
import { C } from '~/utils/theme'
import { arrowHead, dist, roundRect } from '~/utils/canvas'

const props = withDefaults(
  defineProps<{
    activePathwayId?: string | null
    compact?: boolean
  }>(),
  { activePathwayId: null, compact: false },
)

const emit = defineEmits<{ open: [string]; hint: [string] }>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const hoverId = ref<string | null>(null)

const groupColor: Record<OverviewNode['group'], string> = {
  kohlenhydrate: '#e0b341',
  lipide: '#e07a52',
  protein: '#d9d24a',
  zentral: '#6ea8fe',
  energie: '#52d273',
}

function isClickable(node: OverviewNode): boolean {
  // anklickbar, wenn ein detaillierter Weg an diesem Knoten hängt
  if (getPathway(node.id)) return true
  return overviewEdges.some(
    (e) => e.status === 'fertig' && e.pathwayId && (e.from === node.id || e.to === node.id),
  )
}

function pathwayForNode(node: OverviewNode): string | null {
  if (getPathway(node.id)) return node.id
  const e = overviewEdges.find(
    (ed) => ed.status === 'fertig' && ed.pathwayId && (ed.from === node.id || ed.to === node.id),
  )
  return e?.pathwayId ?? null
}

let nodePx = new Map<string, { x: number; y: number }>()

function draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.clearRect(0, 0, w, h)
  ctx.fillStyle = C.bg
  ctx.fillRect(0, 0, w, h)

  const pad = Math.min(w, h) * 0.06
  const toPx = (nx: number, ny: number) => ({ x: pad + nx * (w - 2 * pad), y: pad + ny * (h - 2 * pad) })
  nodePx = new Map(overviewNodes.map((n) => [n.id, toPx(n.x, n.y)]))

  // Gegenläufige Kanten (gleiches Knotenpaar) erkennen -> auseinanderziehen
  const pairCount = new Map<string, number>()
  for (const e of overviewEdges) {
    const k = [e.from, e.to].sort().join('|')
    pairCount.set(k, (pairCount.get(k) ?? 0) + 1)
  }
  const geomOf = (e: (typeof overviewEdges)[number]) => {
    const a = nodePx.get(e.from)!
    const b = nodePx.get(e.to)!
    const key = [e.from, e.to].sort().join('|')
    const twin = (pairCount.get(key) ?? 1) > 1
    // Senkrechte anhand kanonischer Reihenfolge -> Zwillinge liegen auf gegenüberliegenden Seiten
    const sign = e.from < e.to ? 1 : -1
    const lo = sign > 0 ? a : b
    const hi = sign > 0 ? b : a
    const dl = Math.hypot(hi.x - lo.x, hi.y - lo.y) || 1
    const perpx = -(hi.y - lo.y) / dl
    const perpy = (hi.x - lo.x) / dl
    const bow = twin ? 16 : 0
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    const ctrl = { x: mx + perpx * bow * sign, y: my + perpy * bow * sign }
    const lp = { x: mx + perpx * (bow + (twin ? 30 : 13)) * sign, y: my + perpy * (bow + (twin ? 30 : 13)) * sign }
    return { a, b, ctrl, lp }
  }

  // Pass 1: Linien + Pfeilspitzen
  for (const e of overviewEdges) {
    const a = nodePx.get(e.from)
    const b = nodePx.get(e.to)
    if (!a || !b) continue
    const fertig = e.status === 'fertig'
    const { ctrl } = geomOf(e)
    ctx.strokeStyle = fertig ? C.accent : C.grid
    ctx.lineWidth = fertig ? 2.6 : 1.6
    ctx.setLineDash(fertig ? [] : [5, 5])
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.quadraticCurveTo(ctrl.x, ctrl.y, b.x, b.y)
    ctx.stroke()
    ctx.setLineDash([])

    const angEnd = Math.atan2(b.y - ctrl.y, b.x - ctrl.x)
    arrowHead(ctx, b.x - Math.cos(angEnd) * 26, b.y - Math.sin(angEnd) * 26, angEnd, 8, fertig ? C.accent : C.edge)
    if (e.reversible) {
      const angStart = Math.atan2(a.y - ctrl.y, a.x - ctrl.x)
      arrowHead(ctx, a.x - Math.cos(angStart) * 26, a.y - Math.sin(angStart) * 26, angStart, 8, fertig ? C.accent : C.edge)
    }
  }

  // Pass 2: Labels (über allen Linien, senkrecht neben die Kante versetzt)
  for (const e of overviewEdges) {
    if (!nodePx.get(e.from) || !nodePx.get(e.to)) continue
    const fertig = e.status === 'fertig'
    const { lp } = geomOf(e)
    ctx.font = `${fertig ? '600' : '500'} 11px ui-sans-serif, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const tw = ctx.measureText(e.name).width
    roundRect(ctx, lp.x - tw / 2 - 6, lp.y - 9, tw + 12, 18, 5)
    ctx.fillStyle = fertig ? 'rgba(20,28,46,0.95)' : 'rgba(20,28,46,0.92)'
    ctx.fill()
    ctx.fillStyle = fertig ? C.edgeStrong : C.muted
    ctx.fillText(e.name, lp.x, lp.y)
  }

  // Knoten
  for (const n of overviewNodes) {
    const px = nodePx.get(n.id)!
    const active = props.activePathwayId && pathwayForNode(n) === props.activePathwayId
    const hovered = hoverId.value === n.id
    const clickable = isClickable(n)

    ctx.font = `600 13px ui-sans-serif, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const tw = ctx.measureText(n.name).width
    const bw = tw + 24
    const bh = 30

    if (active || hovered) {
      ctx.beginPath()
      roundRect(ctx, px.x - bw / 2 - 4, px.y - bh / 2 - 4, bw + 8, bh + 8, 12)
      ctx.fillStyle = C.ring
      ctx.fill()
    }

    roundRect(ctx, px.x - bw / 2, px.y - bh / 2, bw, bh, 9)
    ctx.fillStyle = C.node
    ctx.fill()
    ctx.lineWidth = clickable ? 2 : 1.2
    ctx.strokeStyle = clickable ? groupColor[n.group] : C.nodeBorder
    ctx.stroke()
    ctx.fillStyle = C.nodeText
    ctx.fillText(n.name, px.x, px.y)

    if (clickable) {
      ctx.beginPath()
      ctx.arc(px.x + bw / 2 - 2, px.y - bh / 2 + 2, 4, 0, Math.PI * 2)
      ctx.fillStyle = C.correct
      ctx.fill()
    }
  }
}

const { render } = useDpiCanvas(canvasRef, draw)
watch(() => [props.activePathwayId, hoverId.value, props.compact], () => render())

function nearestNode(ev: MouseEvent) {
  if (!canvasRef.value) return null
  const rect = canvasRef.value.getBoundingClientRect()
  const px = ev.clientX - rect.left
  const py = ev.clientY - rect.top
  let best: { id: string; d: number } | null = null
  for (const [id, p] of nodePx) {
    const d = dist(px, py, p.x, p.y)
    if (!best || d < best.d) best = { id, d }
  }
  return best && best.d < 60 ? best.id : null
}

function onMove(ev: MouseEvent) {
  hoverId.value = nearestNode(ev)
}
function onClick(ev: MouseEvent) {
  const id = nearestNode(ev)
  if (!id) return
  const node = overviewNodes.find((n) => n.id === id)!
  const pw = pathwayForNode(node)
  if (pw) emit('open', pw)
  else emit('hint', `${node.name}: noch kein Detail-Quiz – kommt später.`)
}
</script>

<template>
  <div class="ov-wrap">
    <canvas ref="canvasRef" @mousemove="onMove" @mouseleave="hoverId = null" @click="onClick" />
  </div>
</template>

<style scoped>
.ov-wrap {
  width: 100%;
  height: 100%;
}
canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: pointer;
  border-radius: 14px;
}
</style>
