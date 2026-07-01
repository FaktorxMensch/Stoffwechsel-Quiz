import type { Pathway } from '~/types/metabolism'
import { citratzyklus } from './citratzyklus'
import { glykolyse } from './glykolyse'
import { gluconeogenese } from './gluconeogenese'
import { pdh } from './pdh'
import { betaOxidation } from './beta-oxidation'
import { harnstoffzyklus } from './harnstoffzyklus'
import { pentosephosphatweg } from './pentosephosphatweg'
import { atmungskette } from './atmungskette'

// Registry aller Stoffwechselwege. Neuen Weg hinzufügen: importieren + hier eintragen.
export const pathways: Record<string, Pathway> = {
  [glykolyse.id]: glykolyse,
  [gluconeogenese.id]: gluconeogenese,
  [pdh.id]: pdh,
  [citratzyklus.id]: citratzyklus,
  [betaOxidation.id]: betaOxidation,
  [pentosephosphatweg.id]: pentosephosphatweg,
  [harnstoffzyklus.id]: harnstoffzyklus,
  [atmungskette.id]: atmungskette,
}

export const pathwayList = Object.values(pathways)

export function getPathway(id: string): Pathway | undefined {
  return pathways[id]
}
