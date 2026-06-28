<script setup lang="ts">
import { getPathway } from '~/data/pathways'
import { buildQuizItems, reactionLabel, type QuizItem } from '~/utils/quiz'
import type { Reaction } from '~/types/metabolism'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)
const pathway = computed(() => getPathway(id.value))

const { record, pickNext, mastery } = useProgress()

const mode = ref<'explore' | 'quiz'>('explore')
const HIT = 55 // Klick-Toleranz in px

// ---- Quiz-State ----
const items = computed<QuizItem[]>(() => (pathway.value ? buildQuizItems(pathway.value) : []))
const cur = ref<QuizItem | null>(null)
const answered = ref(false)
const wasCorrect = ref(false)
const feedback = ref('')
const clickMarker = ref<{ x: number; y: number; color: string } | null>(null)
const revealReactionId = ref<string | null>(null)
const choices = ref<{ text: string; correct: boolean }[]>([])
const chosen = ref<number | null>(null)
const cofactorPrompt = ref('')

function reactionOf(item: QuizItem): Reaction | undefined {
  return pathway.value?.reactions.find((r) => r.id === item.reactionId)
}
function curReaction() {
  return cur.value ? reactionOf(cur.value) : undefined
}
function curNode() {
  return pathway.value?.nodes.find((n) => n.id === cur.value?.nodeId)
}

const stats = computed(() => mastery(items.value.map((i) => i.id)))

function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function nextQuestion() {
  if (!pathway.value || !items.value.length) return
  const nextId = pickNext(items.value.map((i) => i.id), cur.value?.id)
  cur.value = items.value.find((i) => i.id === nextId) ?? null
  answered.value = false
  wasCorrect.value = false
  feedback.value = ''
  clickMarker.value = null
  revealReactionId.value = null
  chosen.value = null
  choices.value = []

  const item = cur.value
  if (!item) return
  if (item.type === 'direction') {
    const r = reactionOf(item)!
    choices.value = [
      { text: 'Reversibel (beide Richtungen)', correct: r.reversible },
      { text: 'Nur eine Richtung (irreversibel)', correct: !r.reversible },
    ]
  } else if (item.type === 'cofactor') {
    const r = reactionOf(item)!
    const outs = r.cofactors.filter((c) => c.dir === 'out')
    const ins = r.cofactors.filter((c) => c.dir === 'in')
    const askOut = outs.length > 0
    cofactorPrompt.value = askOut ? 'Welches Molekül wird frei?' : 'Welches Molekül wird verbraucht?'
    const pickFrom = askOut ? outs : ins
    const target = pickFrom[Math.floor(Math.random() * pickFrom.length)].name
    const used = new Set(r.cofactors.map((c) => c.name))
    const pool = new Set<string>()
    for (const rr of pathway.value!.reactions) for (const c of rr.cofactors) pool.add(c.name)
    const distractors = shuffle([...pool].filter((n) => !used.has(n))).slice(0, 3)
    choices.value = shuffle([
      { text: target, correct: true },
      ...distractors.map((n) => ({ text: n, correct: false })),
    ])
  }
}

function startQuiz() {
  mode.value = 'quiz'
  nextQuestion()
}

function onPick(p: {
  nearestNodeId: string
  nodeDist: number
  nearestReactionId: string
  reactionDist: number
  nx: number
  ny: number
}) {
  if (answered.value || !cur.value) return
  const item = cur.value
  if (item.type === 'locate-node') {
    const ok = p.nearestNodeId === item.nodeId && p.nodeDist <= HIT
    finishClick(ok, p.nx, p.ny)
    const node = curNode()
    feedback.value = ok
      ? `Richtig: ${node?.name}.`
      : `Daneben. ${node?.name} ist markiert.`
  } else if (item.type === 'locate-enzyme') {
    const ok = p.nearestReactionId === item.reactionId && p.reactionDist <= HIT
    revealReactionId.value = item.reactionId ?? null
    finishClick(ok, p.nx, p.ny)
    const r = curReaction()
    feedback.value = ok
      ? `Richtig: ${r?.enzyme} (${reactionLabel(pathway.value!, r!)}).`
      : `Daneben. Die richtige Reaktion ist hervorgehoben.`
  }
}

function finishClick(ok: boolean, nx: number, ny: number) {
  answered.value = true
  wasCorrect.value = ok
  clickMarker.value = { x: nx, y: ny, color: ok ? '#52d273' : '#f0607a' }
  record(cur.value!.id, ok)
}

function choose(i: number) {
  if (answered.value) return
  chosen.value = i
  const ok = choices.value[i].correct
  answered.value = true
  wasCorrect.value = ok
  record(cur.value!.id, ok)
  const r = curReaction()
  revealReactionId.value = r?.id ?? null
  if (cur.value!.type === 'direction') {
    feedback.value = `${r?.enzyme}: ${r?.reversible ? 'reversibel' : 'irreversibel (nur eine Richtung)'}.${r?.note ? ' ' + r.note : ''}`
  } else {
    const outs = r!.cofactors.filter((c) => c.dir === 'out').map((c) => c.name).join(', ') || '–'
    const insL = r!.cofactors.filter((c) => c.dir === 'in').map((c) => c.name).join(', ') || '–'
    feedback.value = `${r?.enzyme}: verbraucht ${insL}; frei wird ${outs}.`
  }
}

// Canvas-Props je nach Modus/Fragetyp
const canvasBind = computed(() => {
  if (mode.value === 'explore' || !cur.value) {
    return {
      hideNodeNames: false,
      hideEnzymes: false,
      hideCofactors: false,
      interactive: false,
      highlightIds: [] as string[],
      revealNodeIds: [] as string[],
      revealReactionId: null as string | null,
      markers: [] as { x: number; y: number; color: string }[],
    }
  }
  const t = cur.value.type
  const isClick = t === 'locate-node' || t === 'locate-enzyme'
  const r = curReaction()
  return {
    hideNodeNames: t === 'locate-node' && !answered.value,
    hideEnzymes: t === 'locate-enzyme' && !answered.value,
    hideCofactors: t === 'locate-enzyme' && !answered.value,
    interactive: isClick && !answered.value,
    highlightIds: answered.value && cur.value.nodeId ? [cur.value.nodeId] : [],
    revealNodeIds: answered.value && cur.value.nodeId ? [cur.value.nodeId] : [],
    revealReactionId: revealReactionId.value,
    markers: clickMarker.value ? [clickMarker.value] : [],
  }
})

const promptText = computed(() => {
  const item = cur.value
  if (!item || !pathway.value) return ''
  if (item.type === 'locate-node') return `Wo liegt „${curNode()?.name}“? Klicke die Position.`
  if (item.type === 'locate-enzyme')
    return `Welche Reaktion katalysiert „${curReaction()?.enzyme}“? Klicke darauf.`
  if (item.type === 'direction')
    return `${reactionLabel(pathway.value, curReaction()!)} – in welche Richtung läuft die Reaktion (${curReaction()?.enzyme})?`
  return `${curReaction()?.enzyme} (${reactionLabel(pathway.value, curReaction()!)}): ${cofactorPrompt.value}`
})
</script>

<template>
  <div v-if="!pathway" class="layout">
    <div class="card">Unbekannter Stoffwechselweg. <NuxtLink to="/">Zur Übersicht</NuxtLink></div>
  </div>

  <div v-else class="layout">
    <div class="stage">
      <PathwayCanvas :pathway="pathway" v-bind="canvasBind" @pick="onPick" />
    </div>

    <aside class="sidebar">
      <!-- Orientierung: Mini-Übersicht -->
      <div class="card">
        <h2>Wo bin ich?</h2>
        <div class="mini-map">
          <OverviewMap :active-pathway-id="pathway.id" compact @open="(pid) => router.push(`/pathway/${pid}`)" />
        </div>
      </div>

      <!-- Modus-Umschalter -->
      <div class="card">
        <div style="display: flex; gap: 8px; margin-bottom: 10px">
          <button class="btn" :class="{ active: mode === 'explore' }" @click="mode = 'explore'">
            Erkunden
          </button>
          <button class="btn" :class="{ active: mode === 'quiz' }" @click="startQuiz">Quiz</button>
        </div>
        <div class="progress"><div :style="{ width: Math.round(stats.ratio * 100) + '%' }" /></div>
        <p class="muted small" style="margin: 6px 0 0">
          Beherrschung {{ Math.round(stats.ratio * 100) }}% · {{ stats.mastered }}/{{ stats.total }} sitzen
        </p>
      </div>

      <!-- QUIZ -->
      <div v-if="mode === 'quiz' && cur" class="card">
        <h2>Frage</h2>
        <h3>{{ promptText }}</h3>

        <div v-if="choices.length" class="choices" style="margin-top: 10px">
          <button
            v-for="(c, i) in choices"
            :key="i"
            :class="{ correct: answered && c.correct, wrong: answered && chosen === i && !c.correct }"
            @click="choose(i)"
          >
            {{ c.text }}
          </button>
        </div>

        <div v-if="answered" class="feedback" :class="wasCorrect ? 'ok' : 'no'">
          {{ wasCorrect ? '✓ ' : '✗ ' }}{{ feedback }}
        </div>

        <button v-if="answered" class="btn primary" style="margin-top: 12px" @click="nextQuestion">
          Weiter →
        </button>
        <p v-if="!answered && (cur.type === 'locate-node' || cur.type === 'locate-enzyme')" class="muted small" style="margin-top: 10px">
          Klicke direkt in die Karte.
        </p>
      </div>

      <!-- EXPLORE -->
      <template v-else>
        <div class="card">
          <h2>{{ pathway.name }}</h2>
          <p v-if="pathway.aka?.length" class="muted small" style="margin-top: -4px">
            {{ pathway.aka.join(' · ') }}
          </p>
          <p class="small">{{ pathway.summary }}</p>
          <p class="small"><span class="muted">Ort:</span> {{ pathway.location }}</p>
        </div>

        <div class="card">
          <h2>Reaktionen</h2>
          <table class="rx">
            <thead>
              <tr>
                <th>Enzym</th>
                <th>Richtung</th>
                <th>Bilanz</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="r in pathway.reactions" :key="r.id">
                <td>
                  {{ r.enzyme }}<span v-if="r.uncertain" class="uncertain" title="bitte prüfen"> *</span>
                  <br /><span class="muted small">{{ reactionLabel(pathway, r) }}</span>
                  <template v-if="r.tags.length">
                    <br /><span class="tag">{{ r.tags.join(', ') }}</span>
                  </template>
                </td>
                <td>{{ r.reversible ? '⇌' : '→' }}</td>
                <td>
                  <span v-for="c in r.cofactors.filter((c) => c.dir === 'in')" :key="c.name" class="cof-in"
                    >+{{ c.name }} </span
                  ><br />
                  <span v-for="c in r.cofactors.filter((c) => c.dir === 'out')" :key="c.name" class="cof-out"
                    >→{{ c.name }} </span
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <NetBalance :pathway="pathway" />

        <div class="card">
          <h2>Quellen</h2>
          <p v-for="s in pathway.sources" :key="s" class="small" style="word-break: break-all">
            <a :href="s" target="_blank" rel="noopener">{{ s }}</a>
          </p>
          <p class="muted small">
            <span class="uncertain">*</span> markierte Angaben (v.&nbsp;a. ΔG-Werte, Energieausbeute)
            bitte selbst gegenprüfen.
          </p>
        </div>
      </template>
    </aside>
  </div>
</template>
