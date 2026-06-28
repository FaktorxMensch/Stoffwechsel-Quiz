<script setup lang="ts">
import type { Pathway } from '~/types/metabolism'

const props = defineProps<{ pathway: Pathway }>()

function onDrag(ev: DragEvent, label: string, value: string) {
  ev.dataTransfer?.setData('text/plain', `${props.pathway.name}: ${value} ${label}`)
}
</script>

<template>
  <div class="card">
    <h2>Netto-Gesamtbilanz</h2>
    <p class="muted small" style="margin-top: -4px">pro Durchlauf · Chips sind ziehbar</p>
    <div
      v-for="item in pathway.net"
      :key="item.label"
      class="net-chip"
      draggable="true"
      @dragstart="onDrag($event, item.label, item.value)"
    >
      <span>
        {{ item.label }}
        <span v-if="item.uncertain" class="uncertain" title="bitte selbst prüfen">*</span>
        <span v-if="item.detail" class="muted small"><br />{{ item.detail }}</span>
      </span>
      <b>{{ item.value }}</b>
    </div>
  </div>
</template>
