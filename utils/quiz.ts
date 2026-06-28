import type { Pathway, Reaction } from '~/types/metabolism'

export type QuizType =
  | 'locate-node'
  | 'locate-enzyme'
  | 'direction'
  | 'cofactor'
  | 'structure'
  | 'branch'
  | 'energy'

export interface QuizItem {
  id: string // stabiler Schlüssel für den Fortschritt
  type: QuizType
  pathwayId: string
  nodeId?: string
  reactionId?: string
}

// Erzeugt alle abfragbaren Items eines Stoffwechselwegs.
export function buildQuizItems(p: Pathway): QuizItem[] {
  const items: QuizItem[] = []
  for (const n of p.nodes) {
    items.push({ id: `${p.id}:node:${n.id}`, type: 'locate-node', pathwayId: p.id, nodeId: n.id })
    if (n.structure) {
      items.push({ id: `${p.id}:struct:${n.id}`, type: 'structure', pathwayId: p.id, nodeId: n.id })
    }
    if (n.branches?.length) {
      items.push({ id: `${p.id}:branch:${n.id}`, type: 'branch', pathwayId: p.id, nodeId: n.id })
    }
  }
  for (const r of p.reactions) {
    items.push({ id: `${p.id}:enzyme:${r.id}`, type: 'locate-enzyme', pathwayId: p.id, reactionId: r.id })
    items.push({ id: `${p.id}:dir:${r.id}`, type: 'direction', pathwayId: p.id, reactionId: r.id })
    if (r.cofactors.length) {
      items.push({ id: `${p.id}:cof:${r.id}`, type: 'cofactor', pathwayId: p.id, reactionId: r.id })
    }
    if (r.deltaG !== undefined) {
      items.push({ id: `${p.id}:energy:${r.id}`, type: 'energy', pathwayId: p.id, reactionId: r.id })
    }
  }
  return items
}

export function reactionLabel(p: Pathway, r: Reaction): string {
  const from = p.nodes.find((n) => n.id === r.from)?.name ?? r.from
  const to = p.nodes.find((n) => n.id === r.to)?.name ?? r.to
  return `${from} → ${to}`
}

// Antwortoptionen für die Cofaktor-Frage: korrekte Outputs + Distraktoren aus dem Weg.
export function cofactorOptions(p: Pathway, r: Reaction): { text: string; correct: boolean }[] {
  const correctOut = r.cofactors.filter((c) => c.dir === 'out').map((c) => c.name)
  const pool = new Set<string>()
  for (const rr of p.reactions) for (const c of rr.cofactors) pool.add(c.name)
  const distractors = [...pool].filter((name) => !correctOut.includes(name))
  // bis zu 3 Distraktoren mischen
  shuffle(distractors)
  const options = [
    ...correctOut.map((name) => ({ text: name, correct: true })),
    ...distractors.slice(0, Math.max(2, 4 - correctOut.length)).map((name) => ({ text: name, correct: false })),
  ]
  return shuffle(options)
}

function shuffle<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
