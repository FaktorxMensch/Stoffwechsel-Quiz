import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Glykogen-Stoffwechsel (Auf- und Abbau). Quellen: Wikipedia, AMBOSS, Lehninger.

export const glykogen: Pathway = {
  id: 'glykogen',
  name: 'Glykogen-Stoffwechsel',
  aka: ['Glykogen-Synthese & -Abbau', 'Glykogenolyse'],
  location: 'Cytosol – v.a. Leber (Blutzucker) und Muskel (Eigenbedarf)',
  summary:
    'Speicherung von Glucose als Glykogen und ihre Freisetzung. Aufbau über Glykogen-Synthase (aktivierte Glucose = UDP-Glucose), Abbau über Glykogen-Phosphorylase. Beide Schlüsselenzyme werden gegenläufig hormonell reguliert (Insulin ↔ Glucagon/Adrenalin).',
  layout: 'linear',
  detailed: true,
  nodes: [
    { id: 'glykogen', name: 'Glykogen', x: 0.5, y: 0.1, structure: S.glykogen },
    { id: 'udpglucose', name: 'UDP-Glucose', x: 0.74, y: 0.34, cAtoms: 6, structure: S.udpGlucose },
    { id: 'glucose1p', name: 'Glucose-1-P', x: 0.5, y: 0.56, cAtoms: 6, structure: S.glucose1p },
    {
      id: 'g6p',
      name: 'Glucose-6-P',
      x: 0.5,
      y: 0.82,
      cAtoms: 6,
      structure: S.g6p,
      branches: [
        { to: 'Glykolyse', note: 'Energiegewinnung' },
        { to: 'Gluconeogenese', note: 'bzw. Glucose-Freisetzung (Leber)' },
        { to: 'Pentosephosphatweg', note: 'NADPH / Ribose' },
      ],
    },
  ],
  reactions: [
    {
      id: 'gy1',
      from: 'glucose1p',
      to: 'udpglucose',
      enzyme: 'UDP-Glucose-Pyrophosphorylase',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [
        { name: 'UTP', dir: 'in' },
        { name: 'PPi', dir: 'out' },
      ],
      note: 'Aktivierung: bildet die „aktivierte“ UDP-Glucose. Die PPi-Hydrolyse macht den Schritt irreversibel.',
    },
    {
      id: 'gy2',
      from: 'udpglucose',
      to: 'glykogen',
      enzyme: 'Glykogen-Synthase',
      reversible: false,
      tags: ['kondensation'],
      cofactors: [{ name: 'UDP', dir: 'out' }],
      note: 'Schlüsselenzym des Aufbaus. Knüpft α-1,4-Bindungen; das Verzweigungsenzym setzt α-1,6-Verzweigungen. Aktiviert durch Insulin.',
    },
    {
      id: 'gy3',
      from: 'glykogen',
      to: 'glucose1p',
      enzyme: 'Glykogen-Phosphorylase',
      reversible: false,
      tags: ['spaltung'],
      cofactors: [{ name: 'Pi', dir: 'in' }],
      note: 'Schlüsselenzym des Abbaus (Phosphorolyse der α-1,4-Bindungen). Coenzym PLP. Aktiviert durch Glucagon/Adrenalin (cAMP); Debranching-Enzym löst α-1,6.',
    },
    {
      id: 'gy4',
      from: 'glucose1p',
      to: 'g6p',
      enzyme: 'Phosphoglucomutase',
      reversible: true,
      tags: ['isomerisierung'],
      cofactors: [],
      note: 'Verbindet den Glykogen-Stoffwechsel mit Glykolyse/Gluconeogenese.',
    },
  ],
  net: [
    { label: 'Aufbau (Synthase)', value: '1 Glucose + UTP', detail: 'pro angehängter Einheit' },
    { label: 'Abbau (Phosphorylase)', value: '→ Glucose-1-P', detail: 'ohne ATP-Verbrauch (Phosphorolyse)' },
    { label: 'Schlüsselenzyme', value: '2', detail: 'Glykogen-Synthase (Aufbau), Glykogen-Phosphorylase (Abbau)' },
    { label: 'Regulation', value: 'hormonell', detail: 'Insulin ↔ Glucagon/Adrenalin (gegenläufig)' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Glycogenesis',
    'https://www.amboss.com/de/wissen/glykogenstoffwechsel',
  ],
}
