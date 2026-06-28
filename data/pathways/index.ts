import type { Pathway } from '~/types/metabolism'
import { citratzyklus } from './citratzyklus'

// Registry aller Stoffwechselwege. Neuen Weg hinzufügen: importieren + hier eintragen.
export const pathways: Record<string, Pathway> = {
  [citratzyklus.id]: citratzyklus,
}

export const pathwayList = Object.values(pathways)

export function getPathway(id: string): Pathway | undefined {
  return pathways[id]
}
