import type { Pathway } from '~/types/metabolism'
import { citratzyklus } from './citratzyklus'
import { glykolyse } from './glykolyse'
import { gluconeogenese } from './gluconeogenese'
import { pdh } from './pdh'
import { betaOxidation } from './beta-oxidation'
import { harnstoffzyklus } from './harnstoffzyklus'
import { pentosephosphatweg } from './pentosephosphatweg'
import { atmungskette } from './atmungskette'
import { laktat } from './laktat'
import { glykogen } from './glykogen'
import { ketogenese } from './ketogenese'
import { fettsaeuresynthese } from './fettsaeuresynthese'
import { aminosaeureabbau } from './aminosaeureabbau'

// Registry aller Stoffwechselwege. Neuen Weg hinzufügen: importieren + hier eintragen.
export const pathways: Record<string, Pathway> = {
  [glykolyse.id]: glykolyse,
  [gluconeogenese.id]: gluconeogenese,
  [glykogen.id]: glykogen,
  [pentosephosphatweg.id]: pentosephosphatweg,
  [laktat.id]: laktat,
  [pdh.id]: pdh,
  [citratzyklus.id]: citratzyklus,
  [atmungskette.id]: atmungskette,
  [betaOxidation.id]: betaOxidation,
  [fettsaeuresynthese.id]: fettsaeuresynthese,
  [ketogenese.id]: ketogenese,
  [aminosaeureabbau.id]: aminosaeureabbau,
  [harnstoffzyklus.id]: harnstoffzyklus,
}

export const pathwayList = Object.values(pathways)

export function getPathway(id: string): Pathway | undefined {
  return pathways[id]
}
