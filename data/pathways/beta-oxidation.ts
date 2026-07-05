import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// β-Oxidation der Fettsäuren – ein Durchgang verkürzt die Acyl-Kette um 2 C
// und liefert 1 Acetyl-CoA, 1 FADH₂, 1 NADH. Quellen: Wikipedia, AMBOSS, Lehninger.

export const betaOxidation: Pathway = {
  id: 'beta-oxidation',
  name: 'β-Oxidation',
  aka: ['Fettsäureabbau'],
  location: 'Mitochondrienmatrix (Aufnahme langer Fettsäuren über den Carnitin-Shuttle)',
  summary:
    'Zyklischer Abbau aktivierter Fettsäuren (Acyl-CoA). Jeder Durchgang (4 Schritte) spaltet ein Acetyl-CoA ab und verkürzt die Kette um 2 C-Atome; dabei entstehen 1 FADH₂ und 1 NADH. Wird so oft wiederholt, bis die Fettsäure vollständig zerlegt ist.',
  layout: 'circle',
  detailed: true,
  nodes: [
    {
      id: 'acyl-coa',
      name: 'Acyl-CoA',
      x: 0.5,
      y: 0.12,
      structure: S.acylCoA,
      branches: [{ to: 'nächster Zyklus', note: 'um 2 C verkürzt – erneuter Durchlauf' }],
    },
    { id: 'enoyl-coa', name: 'trans-Δ²-Enoyl-CoA', x: 0.86, y: 0.5, structure: S.enoylCoA },
    { id: 'hydroxyacyl-coa', name: 'L-3-Hydroxyacyl-CoA', x: 0.5, y: 0.88, structure: S.hydroxyacylCoA },
    { id: 'ketoacyl-coa', name: '3-Ketoacyl-CoA', x: 0.14, y: 0.5, structure: S.ketoacylCoA },
  ],
  reactions: [
    {
      id: 'bo1',
      from: 'acyl-coa',
      to: 'enoyl-coa',
      enzyme: 'Acyl-CoA-Dehydrogenase',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'FAD', dir: 'in' },
        { name: 'FADH2', dir: 'out' },
      ],
      note: 'Oxidation (Einführung der trans-Doppelbindung). FADH₂ → Atmungskette (Komplex II-Ebene).',
    },
    {
      id: 'bo2',
      from: 'enoyl-coa',
      to: 'hydroxyacyl-coa',
      enzyme: 'Enoyl-CoA-Hydratase',
      reversible: false,
      tags: ['hydratisierung'],
      cofactors: [{ name: 'H2O', dir: 'in' }],
      note: 'Wasseranlagerung an die Doppelbindung.',
    },
    {
      id: 'bo3',
      from: 'hydroxyacyl-coa',
      to: 'ketoacyl-coa',
      enzyme: '3-Hydroxyacyl-CoA-Dehydrogenase',
      reversible: false,
      tags: ['redox'],
      cofactors: [
        { name: 'NAD+', dir: 'in' },
        { name: 'NADH+H+', dir: 'out' },
      ],
      note: 'Oxidation der Hydroxy- zur Ketogruppe.',
    },
    {
      id: 'bo4',
      from: 'ketoacyl-coa',
      to: 'acyl-coa',
      enzyme: 'β-Ketothiolase',
      reversible: false,
      tags: ['spaltung'],
      cofactors: [
        { name: 'CoA-SH', dir: 'in' },
        { name: 'Acetyl-CoA', dir: 'out' },
      ],
      note: 'Thiolytische Spaltung: Acetyl-CoA wird abgespalten, das Acyl-CoA ist um 2 C kürzer.',
    },
  ],
  net: [
    { label: 'Acetyl-CoA', value: '1×', detail: 'pro Durchgang → Citratzyklus' },
    { label: 'FADH₂', value: '1×', detail: 'Acyl-CoA-Dehydrogenase' },
    { label: 'NADH + H⁺', value: '1×', detail: '3-Hydroxyacyl-CoA-Dehydrogenase' },
    { label: 'Kettenverkürzung', value: '−2 C', detail: 'pro Durchgang' },
    { label: 'Redoxreaktionen', value: '2' },
    { label: 'Energie (Beispiel)', value: '≈ 4 ATP', detail: '1 FADH₂ + 1 NADH pro Runde (über Atmungskette)', uncertain: true },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Beta_oxidation',
    'https://www.amboss.com/de/wissen/fettsaeureabbau',
  ],
}
