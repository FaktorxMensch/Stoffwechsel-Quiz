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
  { id: 'aminosaeuren', name: 'Aminosäuren', x: 0.12, y: 0.1, group: 'protein' },
  { id: 'glucose', name: 'Glucose', x: 0.5, y: 0.08, group: 'kohlenhydrate' },
  { id: 'fettsaeuren', name: 'Fettsäuren', x: 0.88, y: 0.1, group: 'lipide' },
  // Speicher / Verzweigungen
  { id: 'glykogen', name: 'Glykogen', x: 0.26, y: 0.26, group: 'kohlenhydrate' },
  { id: 'g6p', name: 'Glucose-6-P', x: 0.5, y: 0.3, group: 'kohlenhydrate' },
  { id: 'ribose5p', name: 'Ribose-5-P', x: 0.74, y: 0.3, group: 'kohlenhydrate' },
  // Mittelachse
  { id: 'pyruvat', name: 'Pyruvat', x: 0.5, y: 0.52, group: 'zentral' },
  { id: 'lactat', name: 'Lactat', x: 0.24, y: 0.52, group: 'zentral' },
  { id: 'acetyl-coa', name: 'Acetyl-CoA', x: 0.5, y: 0.7, group: 'zentral' },
  { id: 'ketonkoerper', name: 'Ketonkörper', x: 0.82, y: 0.7, group: 'lipide' },
  // Energie / Endpunkte
  { id: 'citratzyklus', name: 'Citratzyklus', x: 0.5, y: 0.88, group: 'energie' },
  { id: 'oxalacetat', name: 'Oxalacetat', x: 0.28, y: 0.86, group: 'energie' },
  { id: 'atmungskette', name: 'Atmungskette / ATP', x: 0.78, y: 0.9, group: 'energie' },
  { id: 'harnstoff', name: 'Harnstoff', x: 0.1, y: 0.4, group: 'protein' },
]

export const overviewEdges: OverviewEdge[] = [
  { id: 'e-glykogen-abbau', name: 'Glykogen-Abbau', from: 'glykogen', to: 'g6p', reversible: false, status: 'geplant' },
  { id: 'e-glykogen-synthese', name: 'Glykogen-Synthese', from: 'g6p', to: 'glykogen', reversible: false, status: 'geplant' },
  { id: 'e-glucose-g6p', name: 'Hexokinase', from: 'glucose', to: 'g6p', reversible: true, status: 'geplant' },
  { id: 'e-ppw', name: 'Pentosephosphatweg', from: 'g6p', to: 'ribose5p', reversible: false, status: 'geplant' },
  { id: 'e-glykolyse', name: 'Glykolyse', from: 'g6p', to: 'pyruvat', reversible: false, pathwayId: 'glykolyse', status: 'fertig' },
  { id: 'e-gluconeogenese', name: 'Gluconeogenese', from: 'pyruvat', to: 'g6p', reversible: false, status: 'geplant' },
  { id: 'e-laktat', name: 'Laktat-Gärung', from: 'pyruvat', to: 'lactat', reversible: true, status: 'geplant' },
  { id: 'e-pdh', name: 'Pyruvat-Dehydrogenase', from: 'pyruvat', to: 'acetyl-coa', reversible: false, status: 'geplant' },
  { id: 'e-aa-pyruvat', name: 'Aminosäure-Abbau', from: 'aminosaeuren', to: 'pyruvat', reversible: true, status: 'geplant' },
  { id: 'e-harnstoff', name: 'Harnstoffzyklus', from: 'aminosaeuren', to: 'harnstoff', reversible: false, status: 'geplant' },
  { id: 'e-boxidation', name: 'β-Oxidation', from: 'fettsaeuren', to: 'acetyl-coa', reversible: false, status: 'geplant' },
  { id: 'e-fettsynthese', name: 'Fettsäure-Synthese', from: 'acetyl-coa', to: 'fettsaeuren', reversible: false, status: 'geplant' },
  { id: 'e-ketogenese', name: 'Ketogenese', from: 'acetyl-coa', to: 'ketonkoerper', reversible: false, status: 'geplant' },
  { id: 'e-citratzyklus', name: 'Citratzyklus', from: 'acetyl-coa', to: 'citratzyklus', reversible: false, pathwayId: 'citratzyklus', status: 'fertig' },
  { id: 'e-anaplerose', name: 'Anaplerose', from: 'pyruvat', to: 'oxalacetat', reversible: false, status: 'geplant' },
  { id: 'e-atmungskette', name: 'Atmungskette', from: 'citratzyklus', to: 'atmungskette', reversible: false, status: 'geplant' },
]
