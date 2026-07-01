import type { Pathway } from '~/types/metabolism'

// Pyruvat-Dehydrogenase-Komplex (PDH)
// Bindeglied zwischen Glykolyse und Citratzyklus. Quellen: Wikipedia, AMBOSS, Lehninger.

export const pdh: Pathway = {
  id: 'pdh',
  name: 'Pyruvat-Dehydrogenase',
  aka: ['PDH-Komplex', 'oxidative Decarboxylierung von Pyruvat'],
  location: 'Mitochondrienmatrix',
  summary:
    'Verbindet Glykolyse und Citratzyklus: oxidative Decarboxylierung von Pyruvat (3 C) zu Acetyl-CoA (2 C). Irreversibel und streng reguliert (Phosphorylierung hemmt). Multienzymkomplex aus E1, E2, E3 mit 5 Coenzymen.',
  layout: 'linear',
  detailed: true,
  nodes: [
    { id: 'pyruvat', name: 'Pyruvat', x: 0.5, y: 0.22, cAtoms: 3 },
    {
      id: 'acetyl-coa',
      name: 'Acetyl-CoA',
      x: 0.5,
      y: 0.78,
      cAtoms: 2,
      branches: [
        { to: 'Citratzyklus', note: 'Hauptweg (aerob)' },
        { to: 'Fettsäuresynthese', note: 'bei Energieüberschuss' },
        { to: 'Ketonkörper', note: 'im Hunger/Diabetes' },
      ],
    },
  ],
  reactions: [
    {
      id: 'pdh1',
      from: 'pyruvat',
      to: 'acetyl-coa',
      enzyme: 'Pyruvat-Dehydrogenase-Komplex',
      reversible: false,
      tags: ['redox', 'decarboxylierung'],
      cofactors: [
        { name: 'NAD+', dir: 'in' },
        { name: 'CoA-SH', dir: 'in' },
        { name: 'CO2', dir: 'out' },
        { name: 'NADH+H+', dir: 'out' },
      ],
      deltaG: -8,
      uncertain: true,
      note: 'Irreversibel. 5 Coenzyme: TPP (Thiaminpyrophosphat), Liponamid, CoA, FAD, NAD⁺. Reguliert durch PDH-Kinase (hemmt, Phosphorylierung) / PDH-Phosphatase (aktiviert). ΔG-Wert grob – bitte prüfen.',
    },
  ],
  net: [
    { label: 'Pyruvat', value: '1×', detail: 'Eingang (3 C)' },
    { label: 'Acetyl-CoA', value: '1×', detail: '2 C, in den Citratzyklus' },
    { label: 'CO₂', value: '1×', detail: 'freigesetzt' },
    { label: 'NADH + H⁺', value: '1×' },
    { label: 'Redoxreaktionen', value: '1' },
    { label: 'Decarboxylierungen', value: '1' },
    { label: 'Reversibel?', value: 'nein', detail: 'irreversibel, reguliert' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Pyruvate_dehydrogenase_complex',
    'https://www.amboss.com/de/wissen/citratzyklus',
  ],
}
