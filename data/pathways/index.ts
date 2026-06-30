import type { Pathway } from '~/types/metabolism'
import { citratzyklus } from './citratzyklus'
import { glykolyse } from './glykolyse'

// Registry aller Stoffwechselwege. Neuen Weg hinzufügen: importieren + hier eintragen.
export const pathways: Record<string, Pathway> = {
  [glykolyse.id]: glykolyse,
  [citratzyklus.id]: citratzyklus,
}

export const pathwayList = Object.values(pathways)

export function getPathway(id: string): Pathway | undefined {
  return pathways[id]
}
