// Übersicht aller Stoffwechselwege als 2D-Karte.
// Knoten = Metabolit-Hubs (Überschneidungspunkte), Kanten = Stoffwechselwege.
// Ein Weg, dessen pathwayId auf einen detaillierten Pathway zeigt, ist anklickbar.

export interface OverviewNode {
  id: string
  name: string
  x: number // 0..1
  y: number
  group: 'kohlenhydrate' | 'lipide' | 'protein' | 'zentral' | 'energie'
}

export interface OverviewEdge {
  id: string
  name: string // Name des Stoffwechselwegs
  from: string
  to: string
  reversible: boolean
  /** Verweis auf detaillierten Pathway (data/pathways) falls vorhanden. */
  pathwayId?: string
  status: 'fertig' | 'geplant'
}

export const overviewNodes: OverviewNode[] = [
  // Eingänge oben
  { id: 'aminosaeuren', name: 'Aminosäuren', x: 0.11, y: 0.08, group: 'protein' },
  { id: 'glucose', name: 'Glucose', x: 0.5, y: 0.06, group: 'kohlenhydrate' },
  { id: 'fettsaeuren', name: 'Fettsäuren', x: 0.9, y: 0.08, group: 'lipide' },
  // Speicher / Verzweigungen
  { id: 'glykogen', name: 'Glykogen', x: 0.24, y: 0.24, group: 'kohlenhydrate' },
  { id: 'g6p', name: 'Glucose-6-P', x: 0.5, y: 0.28, group: 'kohlenhydrate' },
  { id: 'ribose5p', name: 'Ribose-5-P', x: 0.84, y: 0.27, group: 'kohlenhydrate' },
  // Mittelachse
  { id: 'harnstoff', name: 'Harnstoff', x: 0.09, y: 0.42, group: 'protein' },
  { id: 'lactat', name: 'Lactat', x: 0.17, y: 0.53, group: 'zentral' },
  { id: 'pyruvat', name: 'Pyruvat', x: 0.5, y: 0.53, group: 'zentral' },
  { id: 'acetyl-coa', name: 'Acetyl-CoA', x: 0.5, y: 0.73, group: 'zentral' },
  { id: 'ketonkoerper', name: 'Ketonkörper', x: 0.88, y: 0.72, group: 'lipide' },
  // Energie / Endpunkte
  { id: 'oxalacetat', name: 'Oxalacetat', x: 0.23, y: 0.85, group: 'energie' },
  { id: 'citratzyklus', name: 'Citratzyklus', x: 0.5, y: 0.92, group: 'energie' },
  { id: 'atmungskette', name: 'Atmungskette / ATP', x: 0.85, y: 0.9, group: 'energie' },
]

export const overviewEdges: OverviewEdge[] = [
  { id: 'e-glykogen-abbau', name: 'Glykogen-Abbau', from: 'glykogen', to: 'g6p', reversible: false, status: 'geplant' },
  { id: 'e-glykogen-synthese', name: 'Glykogen-Synthese', from: 'g6p', to: 'glykogen', reversible: false, status: 'geplant' },
  { id: 'e-glucose-g6p', name: 'Hexokinase', from: 'glucose', to: 'g6p', reversible: true, status: 'geplant' },
  { id: 'e-ppw', name: 'Pentosephosphatweg', from: 'g6p', to: 'ribose5p', reversible: false, pathwayId: 'pentosephosphatweg', status: 'fertig' },
  { id: 'e-glykolyse', name: 'Glykolyse', from: 'g6p', to: 'pyruvat', reversible: false, pathwayId: 'glykolyse', status: 'fertig' },
  { id: 'e-gluconeogenese', name: 'Gluconeogenese', from: 'pyruvat', to: 'g6p', reversible: false, pathwayId: 'gluconeogenese', status: 'fertig' },
  { id: 'e-laktat', name: 'Laktat-Gärung', from: 'pyruvat', to: 'lactat', reversible: true, status: 'geplant' },
  { id: 'e-pdh', name: 'Pyruvat-Dehydrogenase', from: 'pyruvat', to: 'acetyl-coa', reversible: false, pathwayId: 'pdh', status: 'fertig' },
  { id: 'e-aa-pyruvat', name: 'Aminosäure-Abbau', from: 'aminosaeuren', to: 'pyruvat', reversible: true, status: 'geplant' },
  { id: 'e-harnstoff', name: 'Harnstoffzyklus', from: 'aminosaeuren', to: 'harnstoff', reversible: false, pathwayId: 'harnstoffzyklus', status: 'fertig' },
  { id: 'e-boxidation', name: 'β-Oxidation', from: 'fettsaeuren', to: 'acetyl-coa', reversible: false, pathwayId: 'beta-oxidation', status: 'fertig' },
  { id: 'e-fettsynthese', name: 'Fettsäure-Synthese', from: 'acetyl-coa', to: 'fettsaeuren', reversible: false, status: 'geplant' },
  { id: 'e-ketogenese', name: 'Ketogenese', from: 'acetyl-coa', to: 'ketonkoerper', reversible: false, status: 'geplant' },
  { id: 'e-citratzyklus', name: 'Citratzyklus', from: 'acetyl-coa', to: 'citratzyklus', reversible: false, pathwayId: 'citratzyklus', status: 'fertig' },
  { id: 'e-anaplerose', name: 'Anaplerose', from: 'pyruvat', to: 'oxalacetat', reversible: false, status: 'geplant' },
  { id: 'e-atmungskette', name: 'Atmungskette', from: 'citratzyklus', to: 'atmungskette', reversible: false, pathwayId: 'atmungskette', status: 'fertig' },
]
