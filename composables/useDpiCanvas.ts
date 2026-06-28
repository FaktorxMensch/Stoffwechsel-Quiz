import type { Ref } from 'vue'

// Richtet einen Canvas mit devicePixelRatio-Skalierung ein und zeichnet bei Resize neu.
// draw(ctx, w, h) bekommt CSS-Pixel-Maße (nicht Geräte-Pixel).
export function useDpiCanvas(
  canvasRef: Ref<HTMLCanvasElement | null>,
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number) => void,
) {
  let ro: ResizeObserver | null = null
  const size = reactive({ w: 0, h: 0 })

  function render() {
    const cv = canvasRef.value
    const parent = cv?.parentElement
    if (!cv || !parent) return
    const rect = parent.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    const w = Math.max(1, rect.width)
    const h = Math.max(1, rect.height)
    cv.width = Math.round(w * dpr)
    cv.height = Math.round(h * dpr)
    cv.style.width = `${w}px`
    cv.style.height = `${h}px`
    const ctx = cv.getContext('2d')
    if (!ctx) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    size.w = w
    size.h = h
    draw(ctx, w, h)
  }

  onMounted(() => {
    render()
    ro = new ResizeObserver(() => render())
    if (canvasRef.value?.parentElement) ro.observe(canvasRef.value.parentElement)
  })
  onBeforeUnmount(() => ro?.disconnect())

  return { render, size }
}
