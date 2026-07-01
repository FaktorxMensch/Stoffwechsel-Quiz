// Datenmodell für Stoffwechselwege.
// Ein neuer Weg = eine neue Datei in data/pathways/ die das Pathway-Interface erfüllt.

/** Was bei einer Reaktion verbraucht (in) oder frei wird (out). */
export interface Cofactor {
  name: string // z.B. "NAD+", "NADH+H+", "CO2", "H2O", "GTP", "CoA-SH", "FAD", "FADH2"
  dir: 'in' | 'out'
}

export type ReactionTag =
  | 'redox' // Redoxreaktion (Dehydrierung/Oxidation)
  | 'decarboxylierung' // CO2 wird abgespalten
  | 'phosphorylierung' // Substratkettenphosphorylierung
  | 'hydratisierung' // Wasseranlagerung
  | 'dehydratisierung' // Wasserabspaltung
  | 'kondensation'
  | 'spaltung' // Aldolspaltung o.ä.
  | 'carboxylierung' // CO2-Anlagerung
  | 'hydrolyse'
  | 'isomerisierung'
  | 'transaminierung'

/** Abzweig: Metabolit verlässt den Weg in einen anderen Stoffwechsel. */
export interface Branch {
  to: string // Zielweg / Verwendung, z.B. "Fettsäuresynthese"
  note?: string
  uncertain?: boolean
}

/** Ein Knoten auf der 2D-Karte (Metabolit oder Hub). Koordinaten normalisiert 0..1. */
export interface MapNode {
  id: string
  name: string
  x: number
  y: number
  kind?: 'metabolite' | 'hub'
  /** Kondensierte Strukturformel (mehrzeilig, in Monospace dargestellt). */
  structure?: string
  /** Anzahl C-Atome (wichtig für Decarboxylierungen). */
  cAtoms?: number
  /** Abzweige in andere Stoffwechselwege. */
  branches?: Branch[]
  /** Markierung für manuell zu prüfende Angaben. */
  uncertain?: boolean
  note?: string
}

/** Eine gerichtete Reaktion zwischen zwei Knoten. */
export interface Reaction {
  id: string
  from: string // node id
  to: string // node id
  enzyme: string
  reversible: boolean
  cofactors: Cofactor[]
  tags: ReactionTag[]
  /** Position des Enzym-Labels auf der Karte (normalisiert). Sonst Mittelpunkt. */
  labelPos?: { x: number; y: number }
  /** ΔG°' in kcal/mol (Lehrbuch-Werte, gerundet). */
  deltaG?: number
  uncertain?: boolean
  note?: string
}

/** Ein Posten der Netto-Gesamtbilanz eines Weges (auf die Übersicht ziehbar). */
export interface NetBalanceItem {
  label: string
  value: string
  detail?: string
  uncertain?: boolean
}

export type PathwayLayout = 'circle' | 'linear'

export interface Pathway {
  id: string
  name: string
  aka?: string[]
  location: string
  summary: string
  layout: PathwayLayout
  nodes: MapNode[]
  reactions: Reaction[]
  net: NetBalanceItem[]
  sources: string[]
  /** Detailansicht fertig? false = nur in Übersicht referenziert. */
  detailed: boolean
}
