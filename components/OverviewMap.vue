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

  // Kanten = Stoffwechselwege
  for (const e of overviewEdges) {
    const a = nodePx.get(e.from)
    const b = nodePx.get(e.to)
    if (!a || !b) continue
    const fertig = e.status === 'fertig'
    ctx.strokeStyle = fertig ? C.accent : C.grid
    ctx.lineWidth = fertig ? 2.6 : 1.6
    ctx.setLineDash(fertig ? [] : [5, 5])
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
    ctx.setLineDash([])

    const ang = Math.atan2(b.y - a.y, b.x - a.x)
    const hx = b.x - Math.cos(ang) * 26
    const hy = b.y - Math.sin(ang) * 26
    arrowHead(ctx, hx, hy, ang, 8, fertig ? C.accent : C.edge)
    if (e.reversible) arrowHead(ctx, a.x + Math.cos(ang) * 26, a.y + Math.sin(ang) * 26, ang + Math.PI, 8, fertig ? C.accent : C.edge)

    // Label
    const mx = (a.x + b.x) / 2
    const my = (a.y + b.y) / 2
    ctx.font = `${fertig ? '600' : '500'} 11px ui-sans-serif, system-ui, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const tw = ctx.measureText(e.name).width
    roundRect(ctx, mx - tw / 2 - 6, my - 9, tw + 12, 18, 5)
    ctx.fillStyle = fertig ? 'rgba(110,168,254,0.18)' : 'rgba(20,28,46,0.92)'
    ctx.fill()
    ctx.fillStyle = fertig ? C.edgeStrong : C.muted
    ctx.fillText(e.name, mx, my)
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
