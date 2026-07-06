<script setup lang="ts">
import { pathwayList } from '~/data/pathways'
import { overviewVideo } from '~/data/pathways/_videos'

const router = useRouter()
const hint = ref<string | null>(null)

function open(id: string) {
  router.push(`/pathway/${id}`)
}
function onHint(msg: string) {
  hint.value = msg
}
</script>

<template>
  <div class="layout">
    <div class="stage">
      <OverviewMap @open="open" @hint="onHint" />
    </div>

    <aside class="sidebar">
      <div class="card">
        <h2>Stoffwechsel-Übersicht</h2>
        <p class="small">
          Die 2D-Karte zeigt, wie die Wege über gemeinsame Metabolite (z.&nbsp;B. Acetyl-CoA,
          Pyruvat) zusammenhängen. Knoten mit grünem Punkt sind anklickbar und führen ins
          Detail-Quiz.
        </p>
        <p v-if="hint" class="feedback no">{{ hint }}</p>
        <p class="small" style="margin-bottom: 0">
          <a :href="overviewVideo.url" target="_blank" rel="noopener">🎬 {{ overviewVideo.title }}</a>
        </p>
      </div>

      <div class="card">
        <h2>Verfügbare Wege</h2>
        <p
          v-for="p in pathwayList"
          :key="p.id"
          style="display: flex; justify-content: space-between; align-items: center"
        >
          <span>{{ p.name }}</span>
          <button class="btn primary" @click="open(p.id)">Lernen →</button>
        </p>
        <p class="muted small">Weitere Wege folgen Schritt für Schritt.</p>
      </div>

      <div class="card">
        <h2>Legende</h2>
        <p class="small">
          <span class="cof-in">+ Stoff</span> = wird verbraucht ·
          <span class="cof-out">→ Stoff</span> = wird frei<br />
          Durchgezogene Kante = fertig · gestrichelt = geplant<br />
          Doppelpfeil = reversibel · <span class="uncertain">*</span> = bitte selbst prüfen
        </p>
      </div>
    </aside>
  </div>
</template>
