import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Laktat-Gärung (anaerobe Glykolyse) – regeneriert NAD⁺ für die Glykolyse.
// Quellen: Wikipedia, AMBOSS, Lehninger.

export const laktat: Pathway = {
  id: 'laktat',
  name: 'Laktat-Gärung',
  aka: ['anaerobe Glykolyse'],
  location: 'Cytosol (Muskel, Erythrozyten, Tumorzellen)',
  summary:
    'Bei Sauerstoffmangel wird Pyruvat zu Laktat reduziert. Der eigentliche Zweck ist die Regeneration von NAD⁺, damit die Glykolyse (und damit die ATP-Bildung) weiterlaufen kann. Laktat wird in der Leber wieder zu Glucose (Cori-Zyklus).',
  layout: 'linear',
  detailed: true,
  nodes: [
    {
      id: 'pyruvat',
      name: 'Pyruvat',
      x: 0.5,
      y: 0.25,
      cAtoms: 3,
      structure: S.pyruvat,
      branches: [{ to: 'Citratzyklus', note: 'aerober Weg (über Pyruvat-Dehydrogenase)' }],
    },
    {
      id: 'lactat',
      name: 'Laktat',
      x: 0.5,
      y: 0.75,
      cAtoms: 3,
      structure: S.lactat,
      branches: [{ to: 'Gluconeogenese', note: 'Cori-Zyklus: Laktat → Glucose in der Leber' }],
    },
  ],
  reactions: [
    {
      id: 'lg1',
      from: 'pyruvat',
      to: 'lactat',
      enzyme: 'Laktat-Dehydrogenase',
      reversible: true,
      tags: ['redox'],
      cofactors: [
        { name: 'NADH+H+', dir: 'in' },
        { name: 'NAD+', dir: 'out' },
      ],
      note: 'LDH. Regeneriert NAD⁺ für die Glykolyse. Reversibel – in der Leber läuft die Rückreaktion (Cori-Zyklus).',
    },
  ],
  net: [
    { label: 'Pyruvat', value: '1×', detail: 'aus der Glykolyse' },
    { label: 'Laktat', value: '1×' },
    { label: 'NAD⁺', value: 'regeneriert', detail: 'ermöglicht Weiterlaufen der Glykolyse' },
    { label: 'ATP', value: '0', detail: 'nur die Glykolyse liefert netto 2 ATP' },
    { label: 'O₂', value: 'nein', detail: 'anaerob' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Lactic_acid_fermentation',
    'https://www.amboss.com/de/wissen/glykolyse',
  ],
}
