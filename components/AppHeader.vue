<script setup lang="ts">
import { getPathway } from '~/data/pathways'

const { profiles, current, addProfile, switchProfile } = useProfile()
const route = useRoute()

const crumb = computed(() => {
  const id = route.params.id as string | undefined
  if (id) return getPathway(id)?.name ?? id
  return null
})

function onSelect(e: Event) {
  const v = (e.target as HTMLSelectElement).value
  if (v === '__new__') {
    const name = window.prompt('Name des neuen Lernprofils:')
    if (name) addProfile(name)
  } else {
    switchProfile(v)
  }
}
</script>

<template>
  <header class="header">
    <h1>🧬 Stoffwechsel-Quiz</h1>
    <span class="crumb">
      <NuxtLink to="/">Übersicht</NuxtLink>
      <template v-if="crumb"> / <b>{{ crumb }}</b></template>
    </span>
    <span class="spacer" />
    <span class="muted small">Profil</span>
    <select class="profile" :value="current" @change="onSelect">
      <option v-for="p in profiles" :key="p" :value="p">{{ p }}</option>
      <option value="__new__">+ Neues Profil…</option>
    </select>
  </header>
</template>
