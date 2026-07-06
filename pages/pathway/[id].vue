<script setup lang="ts">
import { getPathway, pathwayList } from '~/data/pathways'
import { pathwayVideos } from '~/data/pathways/_videos'
import { buildQuizItems, reactionLabel, type QuizItem } from '~/utils/quiz'
import type { Reaction } from '~/types/metabolism'

const route = useRoute()
const router = useRouter()
const id = computed(() => route.params.id as string)
const pathway = computed(() => getPathway(id.value))
const videos = computed(() => pathwayVideos[id.value] ?? [])

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

// Erkunden-Modus: ausgewählter Metabolit (zeigt Strukturformel + Abzweige)
const selectedNodeId = ref<string | null>(null)
const selectedNode = computed(() => pathway.value?.nodes.find((n) => n.id === selectedNodeId.value) ?? null)

// häufige Stoffwechselwege als Distraktoren für Abzweig-Fragen
const COMMON_PATHWAYS = [
  'Fettsäuresynthese',
  'Gluconeogenese',
  'Glykolyse',
  'Aminosäuren',
  'Häm-Synthese',
  'Cholesterinsynthese',
  'Glykogensynthese',
  'Pentosephosphatweg',
  'Harnstoffzyklus',
  'Ketonkörper',
]

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
  } else if (item.type === 'structure') {
    const node = curNode()!
    const others = shuffle(pathway.value!.nodes.filter((n) => n.id !== node.id).map((n) => n.name)).slice(0, 3)
    choices.value = shuffle([
      { text: node.name, correct: true },
      ...others.map((n) => ({ text: n, correct: false })),
    ])
  } else if (item.type === 'branch') {
    const node = curNode()!
    const own = node.branches!.map((b) => b.to)
    const target = own[Math.floor(Math.random() * own.length)]
    const distractors = shuffle(COMMON_PATHWAYS.filter((pw) => !own.includes(pw))).slice(0, 3)
    choices.value = shuffle([
      { text: target, correct: true },
      ...distractors.map((n) => ({ text: n, correct: false })),
    ])
  } else if (item.type === 'energy') {
    const r = reactionOf(item)!
    const others = [...new Set(pathway.value!.reactions.map((rr) => rr.deltaG).filter((g) => g !== undefined && g !== r.deltaG))] as number[]
    const distractors = shuffle(others).slice(0, 3)
    choices.value = shuffle([
      { text: fmtG(r.deltaG!), correct: true },
      ...distractors.map((g) => ({ text: fmtG(g), correct: false })),
    ])
  }
}

function fmtG(g: number): string {
  return `${g > 0 ? '+' : ''}${g} kcal/mol`
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
  // Erkunden: Metabolit auswählen -> Strukturformel/Abzweige anzeigen
  if (mode.value === 'explore') {
    selectedNodeId.value = p.nodeDist <= HIT ? p.nearestNodeId : null
    return
  }
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
  const t = cur.value!.type
  const r = curReaction()
  const node = curNode()
  if (t === 'direction') {
    revealReactionId.value = r?.id ?? null
    feedback.value = `${r?.enzyme}: ${r?.reversible ? 'reversibel' : 'irreversibel (nur eine Richtung)'}.${r?.note ? ' ' + r.note : ''}`
  } else if (t === 'cofactor') {
    revealReactionId.value = r?.id ?? null
    const outs = r!.cofactors.filter((c) => c.dir === 'out').map((c) => c.name).join(', ') || '–'
    const insL = r!.cofactors.filter((c) => c.dir === 'in').map((c) => c.name).join(', ') || '–'
    feedback.value = `${r?.enzyme}: verbraucht ${insL}; frei wird ${outs}.`
  } else if (t === 'structure') {
    feedback.value = `Das ist ${node?.name} (${node?.cAtoms} C-Atome).`
  } else if (t === 'branch') {
    const all = node!.branches!.map((b) => `${b.to}${b.note ? ` (${b.note})` : ''}`).join('; ')
    feedback.value = `${node?.name} → ${all}`
  } else if (t === 'energy') {
    revealReactionId.value = r?.id ?? null
    const g = r!.deltaG!
    feedback.value = `${r?.enzyme}: ΔG°′ = ${fmtG(g)} (${g < 0 ? 'exergon' : g > 0 ? 'endergon' : 'nahe 0'}).`
  }
}

// Canvas-Props je nach Modus/Fragetyp
const canvasBind = computed(() => {
  if (mode.value === 'explore' || !cur.value) {
    // Erkunden: alles sichtbar, Knoten anklickbar (Auswahl zeigt Details)
    return {
      hideNodeNames: false,
      hideEnzymes: false,
      hideCofactors: false,
      hideDeltaG: false,
      hideBranches: false,
      hideDirection: false,
      interactive: true,
      highlightIds: selectedNodeId.value ? [selectedNodeId.value] : [],
      revealNodeIds: [] as string[],
      revealReactionId: null as string | null,
      markers: [] as { x: number; y: number; color: string }[],
    }
  }
  const t = cur.value.type
  const isClick = t === 'locate-node' || t === 'locate-enzyme'
  const nodeId = cur.value.nodeId
  const q = !answered.value // Frage noch offen -> verdecken; nach Antwort alles zeigen
  return {
    // Metabolit lokalisieren: nur Gerüst + Punkte, alle Beschriftungen weg
    hideNodeNames: t === 'locate-node' && q,
    // Enzymnamen verraten oft die Position (z.B. „Pyruvat-Kinase“ neben Pyruvat)
    hideEnzymes: (t === 'locate-node' || t === 'locate-enzyme') && q,
    // Cofaktoren = Edukte/Produkte; ihre Namen verraten Position bzw. die Cofaktor-Antwort
    hideCofactors:
      (t === 'locate-node' || t === 'locate-enzyme' || t === 'cofactor' || t === 'structure') && q,
    hideDeltaG: (t === 'locate-node' || t === 'energy') && q, // ΔG nicht verraten
    hideBranches: (t === 'locate-node' || t === 'branch') && q, // Abzweige nicht verraten
    hideDirection: t === 'direction' && q, // Pfeilrichtung nicht verraten
    interactive: isClick && !answered.value,
    highlightIds: answered.value && nodeId ? [nodeId] : [],
    revealNodeIds: answered.value && nodeId ? [nodeId] : [],
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
  if (item.type === 'structure') return 'Welcher Metabolit hat diese Strukturformel?'
  if (item.type === 'branch') return `In welchen Stoffwechselweg kann „${curNode()?.name}“ übergehen?`
  if (item.type === 'energy')
    return `Wie groß ist ΔG°′ für „${curReaction()?.enzyme}“ (${reactionLabel(pathway.value, curReaction()!)})?`
  return `${curReaction()?.enzyme} (${reactionLabel(pathway.value, curReaction()!)}): ${cofactorPrompt.value}`
})

// Abzweig-Ziele (Namen), die zu einem Detailweg führen -> klickbar zum Springen
const branchNameToId = computed(() => {
  const m = new Map<string, string>()
  for (const p of pathwayList) {
    m.set(p.name, p.id)
    for (const a of p.aka ?? []) m.set(a, p.id)
  }
  return m
})
const linkableBranchNames = computed(() => [...branchNameToId.value.keys()])

function onBranch(name: string) {
  const id = branchNameToId.value.get(name)
  if (id && id !== pathway.value?.id) router.push(`/pathway/${id}`)
}

const entryExit = computed(() => {
  const p = pathway.value
  if (!p || !p.nodes.length) return ''
  if (p.layout === 'linear') {
    return `${p.nodes[0].name} → … → ${p.nodes[p.nodes.length - 1].name}`
  }
  return `Zyklus über ${p.nodes.length} Metabolite`
})

const quizStructure = computed(() =>
  cur.value?.type === 'structure' ? (curNode()?.structure ?? null) : null,
)
</script>

<template>
  <div v-if="!pathway" class="layout">
    <div class="card">Unbekannter Stoffwechselweg. <NuxtLink to="/">Zur Übersicht</NuxtLink></div>
  </div>

  <div v-else class="layout">
    <div class="stage">
      <PathwayCanvas
        :pathway="pathway"
        v-bind="canvasBind"
        :linkable-branches="linkableBranchNames"
        @pick="onPick"
        @branch="onBranch"
      />
    </div>

    <aside class="sidebar">
      <!-- Orientierung -->
      <div class="card">
        <h2>Orientierung</h2>
        <div class="path-chips">
          <button
            v-for="p in pathwayList"
            :key="p.id"
            class="path-chip"
            :class="{ active: p.id === pathway.id }"
            @click="p.id !== pathway.id && router.push(`/pathway/${p.id}`)"
          >
            {{ p.name }}
          </button>
        </div>
        <p class="muted small" style="margin: 8px 0 0">{{ entryExit }}</p>
        <NuxtLink to="/" class="small">↗ Gesamtübersicht</NuxtLink>
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

        <pre v-if="quizStructure" class="formula">{{ quizStructure }}</pre>
        <p v-if="quizStructure?.includes('Ⓟ')" class="muted small" style="margin: 4px 0 0">
          Ⓟ = Phosphatgruppe (–PO₃²⁻)
        </p>

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
          <p class="muted small">Tipp: Metabolit in der Karte anklicken für Strukturformel & Abzweige.</p>
        </div>

        <div v-if="videos.length" class="card">
          <h2>🎬 Meditricks-Videos</h2>
          <p
            v-for="v in videos"
            :key="v.url"
            style="margin: 0 0 6px"
          >
            <a :href="v.url" target="_blank" rel="noopener">▶ {{ v.title }}</a>
          </p>
        </div>

        <!-- Ausgewählter Metabolit -->
        <div v-if="selectedNode" class="card">
          <h2>{{ selectedNode.name }}</h2>
          <div style="display: flex; gap: 16px; align-items: flex-start">
            <pre v-if="selectedNode.structure" class="formula">{{ selectedNode.structure }}</pre>
            <div class="small">
              <p v-if="selectedNode.cAtoms"><span class="muted">C-Atome:</span> {{ selectedNode.cAtoms }}</p>
              <template v-if="selectedNode.branches?.length">
                <p class="muted" style="margin-bottom: 4px">Geht über in:</p>
                <p v-for="b in selectedNode.branches" :key="b.to" style="margin: 0 0 4px">
                  <a
                    v-if="branchNameToId.get(b.to) && branchNameToId.get(b.to) !== pathway.id"
                    href="#"
                    @click.prevent="onBranch(b.to)"
                    >→ {{ b.to }} ↗</a
                  >
                  <span v-else style="color: var(--accent)">→ {{ b.to }}</span>
                  <span v-if="b.note" class="muted"><br />{{ b.note }}</span>
                </p>
              </template>
              <p v-else class="muted">Kein Abzweig in andere Wege.</p>
              <p v-if="selectedNode.structure?.includes('Ⓟ')" class="muted">Ⓟ = Phosphatgruppe (–PO₃²⁻)</p>
              <p v-if="selectedNode.note" class="uncertain small">{{ selectedNode.note }}</p>
            </div>
          </div>
        </div>

        <div class="card">
          <h2>Reaktionen</h2>
          <table class="rx">
            <thead>
              <tr>
                <th>Enzym</th>
                <th>Richtung</th>
                <th>ΔG°′</th>
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
                <td
                  :class="r.deltaG === undefined ? 'muted' : r.deltaG < 0 ? 'cof-in' : r.deltaG > 0 ? 'cof-out' : 'muted'"
                  style="white-space: nowrap"
                >
                  <template v-if="r.deltaG !== undefined">{{ r.deltaG > 0 ? '+' : '' }}{{ r.deltaG }}</template>
                  <template v-else>–</template>
                </td>
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
            ΔG°′-Werte (kcal/mol) gerundet nach Lehrbuch (Lippincott). Mit <span class="uncertain">*</span>
            markierte Angaben (z.&nbsp;B. ATP-Energieausbeute) bitte selbst gegenprüfen.
          </p>
        </div>
      </template>
    </aside>
  </div>
</template>
