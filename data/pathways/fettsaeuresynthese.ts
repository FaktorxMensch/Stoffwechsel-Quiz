import type { Pathway } from '~/types/metabolism'
import { S } from './_structures'

// Fettsäuresynthese (De-novo-Lipogenese) – Aufbau von Palmitat aus Acetyl-CoA.
// Quellen: Wikipedia, AMBOSS, Lehninger.

export const fettsaeuresynthese: Pathway = {
  id: 'fettsaeuresynthese',
  name: 'Fettsäuresynthese',
  aka: ['De-novo-Lipogenese', 'Fettsäure-Biosynthese'],
  location: 'Cytosol – Leber, Fettgewebe, laktierende Brustdrüse',
  summary:
    'Aufbau der gesättigten C16-Fettsäure Palmitat aus Acetyl-CoA. Acetyl-CoA-Carboxylase (Schrittmacher) bildet Malonyl-CoA, die Fettsäure-Synthase verlängert die Kette zyklisch um je 2 C unter Verbrauch von NADPH. Gegenspieler der β-Oxidation (räumlich getrennt: Cytosol vs. Mitochondrium).',
  layout: 'linear',
  detailed: true,
  nodes: [
    {
      id: 'acetyl-coa',
      name: 'Acetyl-CoA',
      x: 0.5,
      y: 0.15,
      cAtoms: 2,
      structure: S.acetylCoA,
      branches: [{ to: 'Citratzyklus', note: 'Herkunft über Citrat-Shuttle aus dem Mitochondrium' }],
    },
    { id: 'malonyl-coa', name: 'Malonyl-CoA', x: 0.5, y: 0.5, cAtoms: 3, structure: S.malonylCoA },
    {
      id: 'palmitat',
      name: 'Palmitat (C16)',
      x: 0.5,
      y: 0.88,
      cAtoms: 16,
      structure: S.palmitat,
      branches: [{ to: 'Triacylglycerine', note: 'Speicherfett / Membranlipide' }],
    },
  ],
  reactions: [
    {
      id: 'fs1',
      from: 'acetyl-coa',
      to: 'malonyl-coa',
      enzyme: 'Acetyl-CoA-Carboxylase',
      reversible: false,
      tags: ['carboxylierung'],
      cofactors: [
        { name: 'ATP', dir: 'in' },
        { name: 'CO2', dir: 'in' },
        { name: 'ADP+Pi', dir: 'out' },
      ],
      note: 'Schlüssel- und Schrittmacherenzym (ACC). Coenzym Biotin. Aktiviert durch Citrat & Insulin, gehemmt durch Palmitoyl-CoA & Glucagon.',
    },
    {
      id: 'fs2',
      from: 'malonyl-coa',
      to: 'palmitat',
      enzyme: 'Fettsäure-Synthase',
      reversible: false,
      tags: ['redox', 'kondensation'],
      cofactors: [
        { name: 'Acetyl-CoA', dir: 'in' },
        { name: 'NADPH+H+', dir: 'in' },
        { name: 'CO2', dir: 'out' },
        { name: 'NADP+', dir: 'out' },
      ],
      note: 'Multifunktioneller Komplex (FAS). Pro Zyklus: Kondensation → Reduktion (NADPH) → Dehydratisierung → Reduktion (NADPH). 7 Zyklen → Palmitat (C16). NADPH stammt aus Pentosephosphatweg & Malatenzym.',
    },
  ],
  net: [
    { label: 'Acetyl-CoA', value: '8×', detail: '1 Starter + 7 als Malonyl-CoA' },
    { label: 'ATP', value: '−7', detail: 'für 7× Acetyl-CoA-Carboxylase' },
    { label: 'NADPH', value: '−14', detail: '2 pro Verlängerungszyklus' },
    { label: 'Palmitat', value: '1× (C16)', detail: 'gesättigte Fettsäure' },
    { label: 'Schrittmacher', value: 'ACC', detail: 'Acetyl-CoA-Carboxylase' },
  ],
  sources: [
    'https://en.wikipedia.org/wiki/Fatty_acid_synthesis',
    'https://www.amboss.com/de/wissen/fettsaeuresynthese',
  ],
}
